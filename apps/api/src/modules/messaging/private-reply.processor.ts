import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { PrivateReplyJob } from '@repo/shared';
import type { Job } from 'bullmq';
import { QUEUES } from '../../queue/queue.constants';
import { InstagramApiClient } from '../instagram/instagram-api.client';
import { DeliveryService } from './delivery.service';

/** Comment -> DM. Meta allows one private reply per comment, within 7 days. */
@Processor(QUEUES.PRIVATE_REPLY, { concurrency: 5 })
export class PrivateReplyProcessor extends WorkerHost {
  constructor(
    private readonly delivery: DeliveryService,
    private readonly api: InstagramApiClient,
  ) {
    super();
  }

  async process(job: Job<PrivateReplyJob>): Promise<void> {
    const { igAccountId, contactId, automationId, commentId, message } = job.data;
    await this.delivery.deliver({
      job,
      kind: 'PRIVATE_REPLY',
      igAccountId,
      contactId,
      automationId,
      countsAsDm: true,
      send: (account, token) =>
        this.api.sendPrivateReply(account.igUserId, commentId, message, token),
    });
  }
}
