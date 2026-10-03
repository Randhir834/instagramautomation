import { createHash } from 'node:crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Headers, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import type { RazorpayEventJob } from '@repo/shared';
import type { Queue } from 'bullmq';
import type { Request } from 'express';
import { verifyHmacSha256 } from '../../common/utils/hmac';
import type { AppConfig } from '../../config/configuration';
import { JOBS, QUEUES } from '../../queue/queue.constants';
import { WebhookDedupeService } from './webhook-dedupe.service';

@Controller('webhooks/razorpay')
@SkipThrottle()
export class RazorpayWebhookController {
  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly dedupe: WebhookDedupeService,
    @InjectQueue(QUEUES.RAZORPAY_EVENTS) private readonly queue: Queue<RazorpayEventJob>,
  ) {}

  /** Subscription and order payment events: verify, dedupe, enqueue, answer 200. */
  @Post()
  @HttpCode(200)
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Headers('x-razorpay-event-id') headerEventId: string | undefined,
  ): Promise<{ received: true }> {
    const secret = this.config.get('razorpay.webhookSecret', { infer: true });
    if (!verifyHmacSha256(req.rawBody, signature, secret)) {
      throw new UnauthorizedException('Invalid signature');
    }

    const eventId =
      headerEventId ??
      createHash('sha256')
        .update(req.rawBody as Buffer)
        .digest('hex');
    if (await this.dedupe.isFirstDelivery('RAZORPAY', eventId)) {
      await this.queue.add(
        JOBS.PROCESS_RAZORPAY_EVENT,
        { eventId, receivedAt: new Date().toISOString(), body: req.body as unknown },
        { jobId: `rzp-${eventId}` },
      );
    }
    return { received: true };
  }
}
