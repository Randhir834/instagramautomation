import { Injectable, Logger } from '@nestjs/common';
import type { InstagramAccount, MessageKind } from '@prisma/client';
import type { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageService } from '../billing/usage.service';
import { MetaApiError } from '../instagram/instagram-api.client';
import { InstagramService } from '../instagram/instagram.service';
import { RateLimiterService } from './rate-limiter.service';

export interface DeliveryRequest {
  job: Job;
  kind: MessageKind;
  igAccountId: string;
  contactId: string;
  automationId?: string;
  /** Private replies and DMs count toward the plan's monthly DM limit; public replies do not. */
  countsAsDm: boolean;
  send: (account: InstagramAccount, accessToken: string) => Promise<void>;
}

/**
 * The one path every outgoing message takes:
 * account check -> plan limit -> rate limit -> send -> MessageLog -> usage counter.
 */
@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly instagram: InstagramService,
    private readonly usage: UsageService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async deliver(req: DeliveryRequest): Promise<void> {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { id: req.igAccountId },
    });
    if (!account || !account.isActive) {
      if (account) await this.log(req, 'FAILED', 'Instagram account is disconnected');
      return;
    }

    if (req.countsAsDm && !(await this.usage.canSendDm(account.userId))) {
      await this.log(req, 'FAILED', 'Monthly DM limit reached');
      return;
    }

    if (!(await this.rateLimiter.tryConsume(account.id))) {
      // Throwing makes BullMQ retry later with backoff.
      throw new Error(`Rate limit reached for account ${account.id}`);
    }

    try {
      await req.send(account, this.instagram.decryptToken(account));
    } catch (err) {
      await this.instagram.noteApiError(account.id, err);
      const retryable = err instanceof MetaApiError ? err.isRetryable : true;
      const attemptsLeft = req.job.attemptsMade + 1 < (req.job.opts.attempts ?? 1);
      if (retryable && attemptsLeft) throw err;
      this.logger.warn(`${req.kind} failed for good: ${(err as Error).message}`);
      await this.log(req, 'FAILED', (err as Error).message.slice(0, 500));
      return;
    }

    await this.log(req, 'SENT');
    if (req.countsAsDm) await this.usage.incrementDm(account.userId);
  }

  private async log(req: DeliveryRequest, status: 'SENT' | 'FAILED', error?: string) {
    try {
      await this.prisma.messageLog.create({
        data: {
          igAccountId: req.igAccountId,
          contactId: req.contactId,
          automationId: req.automationId ?? null,
          direction: 'OUTBOUND',
          kind: req.kind,
          status,
          error,
        },
      });
    } catch (err) {
      // The contact or account may have been deleted meanwhile; never fail a send over a log row.
      this.logger.warn(`Could not write MessageLog: ${(err as Error).message}`);
    }
  }
}
