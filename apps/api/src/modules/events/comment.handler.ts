import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { CommentReplyJob } from '@repo/shared';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { JOBS, QUEUES } from '../../queue/queue.constants';
import { RedisService } from '../../redis/redis.service';
import { MatcherService } from '../automations/matcher.service';
import { UsageService } from '../billing/usage.service';
import { ContactsService } from '../contacts/contacts.service';
import { FlowEngineService } from '../flows/flow-engine.service';
import type { ParsedComment } from './meta-payload';

/** Longer than Meta's 7-day private reply window, so a comment is never answered twice. */
const COMMENT_CLAIM_SECONDS = 8 * 24 * 60 * 60;

/** A follower commented: find the matching automation and start it. */
@Injectable()
export class CommentHandler {
  private readonly logger = new Logger(CommentHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly matcher: MatcherService,
    private readonly contacts: ContactsService,
    private readonly usage: UsageService,
    private readonly flows: FlowEngineService,
    @InjectQueue(QUEUES.COMMENT_REPLY) private readonly commentReplies: Queue<CommentReplyJob>,
  ) {}

  async handle(comment: ParsedComment): Promise<void> {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { igUserId: comment.igUserId },
    });
    if (!account || !account.isActive) return;

    // Our own public replies are comments too. Answering them would loop forever.
    if (comment.fromId === account.igUserId || comment.fromUsername === account.username) return;

    const claimKey = `comment:${comment.commentId}`;
    if (!(await this.redis.claimOnce(claimKey, COMMENT_CLAIM_SECONDS))) return;

    try {
      const automation = await this.matcher.findMatch({
        igAccountId: account.id,
        triggerType: 'COMMENT',
        text: comment.text,
        postId: comment.mediaId,
      });
      if (!automation) return;

      const contact = await this.contacts.upsertFromInteraction(
        account.id,
        comment.fromId,
        comment.fromUsername,
      );

      if (!(await this.usage.canSendDm(account.userId))) {
        this.logger.warn(`DM limit reached for user ${account.userId}; comment not answered`);
        return;
      }

      if (automation.publicReplies.length > 0) {
        const reply =
          automation.publicReplies[Math.floor(Math.random() * automation.publicReplies.length)];
        await this.commentReplies.add(
          JOBS.SEND_COMMENT_REPLY,
          {
            igAccountId: account.id,
            contactId: contact.id,
            automationId: automation.id,
            commentId: comment.commentId,
            message: reply as string,
          },
          { jobId: `cr-${comment.commentId}` },
        );
      }

      await this.flows.startFromComment({
        account,
        contact,
        automation,
        commentId: comment.commentId,
      });
    } catch (err) {
      // Release the claim so the retry can process this comment.
      await this.redis.client.del(claimKey);
      throw err;
    }
  }
}
