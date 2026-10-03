import { createHash } from 'node:crypto';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import type { MetaEventJob } from '@repo/shared';
import type { Queue } from 'bullmq';
import type { Request } from 'express';
import { verifyHmacSha256 } from '../../common/utils/hmac';
import type { AppConfig } from '../../config/configuration';
import { JOBS, QUEUES } from '../../queue/queue.constants';
import { WebhookDedupeService } from './webhook-dedupe.service';

@Controller('webhooks/meta')
@SkipThrottle()
export class MetaWebhookController {
  private readonly logger = new Logger(MetaWebhookController.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly dedupe: WebhookDedupeService,
    @InjectQueue(QUEUES.META_EVENTS) private readonly queue: Queue<MetaEventJob>,
  ) {}

  /** Subscription handshake: Meta calls this once when the webhook is configured. */
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const expected = this.config.get('meta.webhookVerifyToken', { infer: true });
    if (mode !== 'subscribe' || !expected || token !== expected) {
      throw new ForbiddenException('Webhook verification failed');
    }
    return challenge;
  }

  /**
   * Event receiver. Does only three cheap things, then answers 200:
   * check the signature, drop duplicates, hand the event to the queue.
   */
  @Post()
  @HttpCode(200)
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
  ): Promise<string> {
    const appSecret = this.config.get('meta.appSecret', { infer: true });
    if (!verifyHmacSha256(req.rawBody, signature, appSecret)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Meta does not send an event id, so the body's hash identifies a delivery.
    const eventId = createHash('sha256')
      .update(req.rawBody as Buffer)
      .digest('hex');
    if (!(await this.dedupe.isFirstDelivery('META', eventId))) {
      this.logger.debug(`Duplicate Meta event ${eventId.slice(0, 12)} ignored`);
      return 'EVENT_RECEIVED';
    }

    await this.queue.add(
      JOBS.PROCESS_META_EVENT,
      { eventId, receivedAt: new Date().toISOString(), body: req.body as unknown },
      { jobId: `meta-${eventId}` },
    );
    return 'EVENT_RECEIVED';
  }
}
