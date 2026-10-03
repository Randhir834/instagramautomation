import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { WebhookSource } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

const DEDUPE_TTL_SECONDS = 24 * 60 * 60;

/** Webhooks can be delivered more than once; this makes processing idempotent. */
@Injectable()
export class WebhookDedupeService {
  private readonly logger = new Logger(WebhookDedupeService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Returns true if this event has NOT been seen before (and claims it).
   * Redis is the fast path; the ProcessedWebhook table is the durable backup.
   */
  async isFirstDelivery(source: WebhookSource, eventId: string): Promise<boolean> {
    const id = `${source}:${eventId}`;
    try {
      if (!(await this.redis.claimOnce(`webhook:${id}`, DEDUPE_TTL_SECONDS))) return false;
    } catch (err) {
      this.logger.warn(`Redis dedupe unavailable, falling back to DB: ${(err as Error).message}`);
    }
    try {
      await this.prisma.processedWebhook.create({ data: { id, source } });
      return true;
    } catch (err) {
      // P2002 = unique violation: already processed.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return false;
      throw err;
    }
  }
}
