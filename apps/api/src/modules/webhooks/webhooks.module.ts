import { Module } from '@nestjs/common';
import { MetaWebhookController } from './meta-webhook.controller';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { WebhookDedupeService } from './webhook-dedupe.service';

/** Lightweight receivers: verify, dedupe, enqueue, answer 200. No business logic here. */
@Module({
  controllers: [MetaWebhookController, RazorpayWebhookController],
  providers: [WebhookDedupeService],
  exports: [WebhookDedupeService],
})
export class WebhooksModule {}
