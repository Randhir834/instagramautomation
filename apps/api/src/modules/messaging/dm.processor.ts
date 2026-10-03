import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { DmJob } from '@repo/shared';
import type { Job } from 'bullmq';
import { QUEUES } from '../../queue/queue.constants';
import { InstagramApiClient } from '../instagram/instagram-api.client';
import { DeliveryService } from './delivery.service';

/**
 * Follow-up DMs inside the 24h messaging window (flow steps).
 * Concurrency stays at 1 so messages to one person arrive in order.
 */
@Processor(QUEUES.DM, { concurrency: 1 })
export class DmProcessor extends WorkerHost {
  constructor(
    private readonly delivery: DeliveryService,
    private readonly api: InstagramApiClient,
  ) {
    super();
  }

  async process(job: Job<DmJob>): Promise<void> {
    const { igAccountId, contactId, automationId, recipientId, message, quickReplies, askFor } =
      job.data;
    await this.delivery.deliver({
      job,
      kind: 'DM',
      igAccountId,
      contactId,
      automationId,
      countsAsDm: true,
      send: (account, token) =>
        this.api.sendMessage(
          account.igUserId,
          recipientId,
          { text: message, quickReplies, askFor },
          token,
        ),
    });
  }
}
