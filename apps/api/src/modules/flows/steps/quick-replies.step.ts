import { Injectable } from '@nestjs/common';
import type { AutomationStep } from '@prisma/client';
import type { QuickRepliesPayload } from '@repo/shared';
import type { OutgoingMessage } from '../../instagram/instagram-api.client';
import type { FlowStep, ReplyResult } from './flow-step.interface';

/** Sends a message with tappable buttons. Payload: `{ text, buttons: [{ title }] }`. */
@Injectable()
export class QuickRepliesStep implements FlowStep {
  readonly types = ['QUICK_REPLIES'] as const;
  readonly waitsForReply = true;

  prompt(step: AutomationStep): OutgoingMessage {
    const payload = step.payload as QuickRepliesPayload;
    return {
      text: payload.text,
      quickReplies: payload.buttons.map((b, i) => ({ title: b.title, payload: `button:${i}` })),
    };
  }

  /** Tapping any button, or typing anything, continues the flow. */
  async onReply(): Promise<ReplyResult> {
    return { outcome: 'next' };
  }
}
