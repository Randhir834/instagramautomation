import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { InstagramModule } from '../instagram/instagram.module';
import { CommentReplyProcessor } from './comment-reply.processor';
import { DeliveryService } from './delivery.service';
import { DmProcessor } from './dm.processor';
import { PrivateReplyProcessor } from './private-reply.processor';
import { RateLimiterService } from './rate-limiter.service';

/** BullMQ processors that send. Imported by the worker only (see worker.ts), never by the API. */
@Module({
  imports: [InstagramModule, BillingModule],
  providers: [
    DeliveryService,
    RateLimiterService,
    PrivateReplyProcessor,
    CommentReplyProcessor,
    DmProcessor,
  ],
})
export class MessagingModule {}
