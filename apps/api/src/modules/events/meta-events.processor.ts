import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { MetaEventJob } from '@repo/shared';
import type { Job } from 'bullmq';
import { QUEUES } from '../../queue/queue.constants';
import { CommentHandler } from './comment.handler';
import { MessageHandler } from './message.handler';
import { parseComments, parseMessages } from './meta-payload';

/**
 * Turns a raw Meta webhook into actions. Each comment and message is claimed
 * by its own id inside the handlers, so a retried job never answers twice.
 */
@Processor(QUEUES.META_EVENTS, { concurrency: 5 })
export class MetaEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(MetaEventsProcessor.name);

  constructor(
    private readonly comments: CommentHandler,
    private readonly messages: MessageHandler,
  ) {
    super();
  }

  async process(job: Job<MetaEventJob>): Promise<void> {
    const comments = parseComments(job.data.body);
    const messages = parseMessages(job.data.body);
    let firstError: unknown;

    for (const comment of comments) {
      try {
        await this.comments.handle(comment);
      } catch (err) {
        firstError ??= err;
        this.logger.error(`Comment ${comment.commentId} failed: ${(err as Error).message}`);
      }
    }
    for (const message of messages) {
      try {
        await this.messages.handle(message);
      } catch (err) {
        firstError ??= err;
        this.logger.error(`Message ${message.messageId} failed: ${(err as Error).message}`);
      }
    }

    // Retry the job if anything failed; handled events are skipped on the retry.
    if (firstError) throw firstError;
  }
}
