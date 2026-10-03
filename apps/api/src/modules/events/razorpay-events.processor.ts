import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { RazorpayEventJob } from '@repo/shared';
import type { Job } from 'bullmq';
import { QUEUES } from '../../queue/queue.constants';
import { BillingService, RazorpaySubscriptionEntity } from '../billing/billing.service';
import { StoreService } from '../store/store.service';

interface RazorpayWebhook {
  event?: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
}

/** Applies Razorpay webhooks: plan changes for subscriptions, delivery for store orders. */
@Processor(QUEUES.RAZORPAY_EVENTS)
export class RazorpayEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(RazorpayEventsProcessor.name);

  constructor(
    private readonly billing: BillingService,
    private readonly store: StoreService,
  ) {
    super();
  }

  async process(job: Job<RazorpayEventJob>): Promise<void> {
    const body = job.data.body as RazorpayWebhook;
    const event = body.event ?? '';
    const payment = body.payload?.payment?.entity;

    if (event.startsWith('subscription.')) {
      const subscription = body.payload?.subscription?.entity;
      if (subscription?.id) await this.billing.applySubscriptionEvent(subscription);
      return;
    }

    if (event === 'order.paid' || event === 'payment.captured') {
      const orderId = body.payload?.order?.entity?.id ?? payment?.order_id;
      // Subscription charges also fire payment.captured, without one of our store orders.
      if (orderId) await this.store.markOrderPaid(orderId, payment?.id);
      return;
    }

    if (event === 'payment.failed') {
      if (payment?.order_id) await this.store.markOrderFailed(payment.order_id);
      return;
    }

    this.logger.debug(`Ignoring Razorpay event "${event}"`);
  }
}
