import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { CommentReplyJob } from '@repo/shared';
import type { Job } from 'bullmq';
import { QUEUES } from '../../queue/queue.constants';
import { InstagramApiClient } from '../instagram/instagram-api.client';
import { DeliveryService } from './delivery.service';

/** Public reply under the follower's comment (e.g. "Check your DMs"). */
@Processor(QUEUES.COMMENT_REPLY, { concurrency: 5 })
export class CommentReplyProcessor extends WorkerHost {
  constructor(
    private readonly delivery: DeliveryService,
    private readonly api: InstagramApiClient,
  ) {
    super();
  }

  async process(job: Job<CommentReplyJob>): Promise<void> {
    const { igAccountId, contactId, automationId, commentId, message } = job.data;
    await this.delivery.deliver({
      job,
      kind: 'COMMENT_REPLY',
      igAccountId,
      contactId,
      automationId,
      countsAsDm: false,
      send: async (_account, token) => {
        await this.api.replyToComment(commentId, message, token);
      },
    });
  }
}
