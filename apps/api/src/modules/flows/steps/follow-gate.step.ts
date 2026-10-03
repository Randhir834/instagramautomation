import { Injectable, Logger } from '@nestjs/common';
import type { AutomationStep } from '@prisma/client';
import type { FollowGatePayload } from '@repo/shared';
import { InstagramApiClient, OutgoingMessage } from '../../instagram/instagram-api.client';
import { InstagramService } from '../../instagram/instagram.service';
import type { FlowStep, ReplyContext, ReplyResult } from './flow-step.interface';

/**
 * Continues only if the contact follows the creator.
 * Payload: `{ promptText, buttonTitle, notFollowingText }`.
 */
@Injectable()
export class FollowGateStep implements FlowStep {
  readonly types = ['FOLLOW_GATE'] as const;
  readonly waitsForReply = true;
  private readonly logger = new Logger(FollowGateStep.name);

  constructor(
    private readonly api: InstagramApiClient,
    private readonly instagram: InstagramService,
  ) {}

  prompt(step: AutomationStep): OutgoingMessage {
    const payload = step.payload as FollowGatePayload;
    return {
      text: payload.promptText,
      quickReplies: [{ title: payload.buttonTitle, payload: 'followed' }],
    };
  }

  async onReply(ctx: ReplyContext): Promise<ReplyResult> {
    const payload = ctx.step.payload as FollowGatePayload;
    let follows: boolean;
    try {
      follows = await this.api.isFollower(
        ctx.contact.igScopedUserId,
        this.instagram.decryptToken(ctx.account),
      );
    } catch (err) {
      // If Meta will not tell us, do not hold a real person hostage: let them through.
      this.logger.warn(`Follow check failed, letting contact through: ${(err as Error).message}`);
      follows = true;
    }
    if (follows) return { outcome: 'next' };
    return {
      outcome: 'retry',
      message: {
        text: payload.notFollowingText,
        quickReplies: [{ title: payload.buttonTitle, payload: 'followed' }],
      },
    };
  }
}
