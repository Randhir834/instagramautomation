import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MatcherService } from '../automations/matcher.service';
import { UsageService } from '../billing/usage.service';
import { ContactsService } from '../contacts/contacts.service';
import { FlowEngineService } from '../flows/flow-engine.service';
import type { ParsedMessage } from './meta-payload';

const MESSAGE_CLAIM_SECONDS = 24 * 60 * 60;

/** A follower sent a DM: continue the flow they are in, or start one by keyword. */
@Injectable()
export class MessageHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly matcher: MatcherService,
    private readonly contacts: ContactsService,
    private readonly usage: UsageService,
    private readonly flows: FlowEngineService,
  ) {}

  async handle(message: ParsedMessage): Promise<void> {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { igUserId: message.igUserId },
    });
    if (!account || !account.isActive) return;

    const claimKey = message.messageId ? `message:${message.messageId}` : null;
    if (claimKey && !(await this.redis.claimOnce(claimKey, MESSAGE_CLAIM_SECONDS))) return;

    try {
      // Also refreshes lastInteractionAt, which is what opens the 24h window.
      const contact = await this.contacts.upsertFromInteraction(account.id, message.senderId);
      await this.prisma.messageLog.create({
        data: {
          igAccountId: account.id,
          contactId: contact.id,
          direction: 'INBOUND',
          kind: 'DM',
          status: 'SENT',
        },
      });

      if (await this.flows.resume(account, contact, message.text)) return;

      const automation = await this.matcher.findMatch({
        igAccountId: account.id,
        triggerType: message.isStoryReply ? 'STORY_REPLY' : 'DM_KEYWORD',
        text: message.text,
      });
      if (!automation) return;
      if (!(await this.usage.canSendDm(account.userId))) return;

      await this.flows.startFromMessage({ account, contact, automation });
    } catch (err) {
      if (claimKey) await this.redis.client.del(claimKey);
      throw err;
    }
  }
}
