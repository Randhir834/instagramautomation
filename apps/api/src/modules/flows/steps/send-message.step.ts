import { Injectable } from '@nestjs/common';
import type { AutomationStep } from '@prisma/client';
import type { SendMessagePayload } from '@repo/shared';
import type { OutgoingMessage } from '../../instagram/instagram-api.client';
import type { FlowStep, ReplyResult } from './flow-step.interface';

/** Sends a plain text DM. Payload: `{ text }`. */
@Injectable()
export class SendMessageStep implements FlowStep {
  readonly types = ['SEND_MESSAGE'] as const;
  readonly waitsForReply = false;

  prompt(step: AutomationStep): OutgoingMessage {
    return { text: (step.payload as SendMessagePayload).text };
  }

  /** Only reached when this was the opening private reply: any answer continues. */
  async onReply(): Promise<ReplyResult> {
    return { outcome: 'next' };
  }
}
