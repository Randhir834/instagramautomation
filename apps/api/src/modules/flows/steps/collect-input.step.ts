import { Injectable } from '@nestjs/common';
import type { AutomationStep } from '@prisma/client';
import { CollectInputPayload, emailSchema, phoneSchema } from '@repo/shared';
import { PrismaService } from '../../../prisma/prisma.service';
import type { OutgoingMessage } from '../../instagram/instagram-api.client';
import type { FlowStep, ReplyContext, ReplyResult } from './flow-step.interface';

/** Pulls an email or phone number out of a free-text reply, or returns null. */
export function parseContactInput(kind: 'email' | 'phone', text: string): string | null {
  if (kind === 'email') {
    // People write "it's riya@mail.com thanks": take the email-looking part.
    const candidate = text.match(/[^\s<>,;]+@[^\s<>,;]+\.[^\s<>,;]+/)?.[0] ?? text;
    const result = emailSchema.safeParse(candidate.replace(/[.!?]+$/, ''));
    return result.success ? result.data : null;
  }
  const result = phoneSchema.safeParse(text.replace(/[^\d+\s()-]/g, ''));
  return result.success ? result.data : null;
}

/**
 * Asks for an email or phone number and saves it on the contact.
 * Payload: `{ promptText, retryText }`.
 */
@Injectable()
export class CollectInputStep implements FlowStep {
  readonly types = ['COLLECT_EMAIL', 'COLLECT_PHONE'] as const;
  readonly waitsForReply = true;

  constructor(private readonly prisma: PrismaService) {}

  private kind(step: AutomationStep): 'email' | 'phone' {
    return step.type === 'COLLECT_EMAIL' ? 'email' : 'phone';
  }

  prompt(step: AutomationStep): OutgoingMessage {
    return { text: (step.payload as CollectInputPayload).promptText, askFor: this.kind(step) };
  }

  async onReply(ctx: ReplyContext): Promise<ReplyResult> {
    const kind = this.kind(ctx.step);
    const value = parseContactInput(kind, ctx.text);
    if (!value) {
      return {
        outcome: 'retry',
        message: { text: (ctx.step.payload as CollectInputPayload).retryText, askFor: kind },
      };
    }
    await this.prisma.contact.update({
      where: { id: ctx.contact.id },
      data: kind === 'email' ? { email: value } : { phone: value },
    });
    return { outcome: 'next' };
  }
}
