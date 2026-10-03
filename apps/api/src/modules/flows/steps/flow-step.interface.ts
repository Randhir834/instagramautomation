import type { AutomationStep, Contact, InstagramAccount, StepType } from '@prisma/client';
import type { OutgoingMessage } from '../../instagram/instagram-api.client';

/** Everything a step needs to judge a follower's reply. */
export interface ReplyContext {
  account: InstagramAccount;
  contact: Contact;
  step: AutomationStep;
  /** The follower's message text (or the title of the button they tapped). */
  text: string;
}

export type ReplyResult =
  /** Reply accepted: move on to the next step. */
  | { outcome: 'next' }
  /** Reply not accepted (bad email, not following yet): send this and stay on the step. */
  | { outcome: 'retry'; message: OutgoingMessage };

/**
 * One kind of step in an automation.
 *
 * A step has two halves: `prompt` builds what we send when the flow arrives at
 * the step, and `onReply` decides what to do with the follower's answer.
 */
export interface FlowStep {
  readonly types: readonly StepType[];
  /** True if the flow must stop after the prompt and wait for the follower. */
  readonly waitsForReply: boolean;
  prompt(step: AutomationStep): OutgoingMessage;
  onReply(ctx: ReplyContext): Promise<ReplyResult>;
}
