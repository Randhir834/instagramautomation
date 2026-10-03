import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { AutomationStep, Contact, InstagramAccount, StepType } from '@prisma/client';
import type { DmJob, PrivateReplyJob } from '@repo/shared';
import type { Queue } from 'bullmq';
import { JOBS, QUEUES } from '../../queue/queue.constants';
import type { AutomationWithSteps } from '../automations/matcher.service';
import type { OutgoingMessage } from '../instagram/instagram-api.client';
import { FlowStateService } from './flow-state.service';
import { CollectInputStep } from './steps/collect-input.step';
import type { FlowStep } from './steps/flow-step.interface';
import { FollowGateStep } from './steps/follow-gate.step';
import { QuickRepliesStep } from './steps/quick-replies.step';
import { SendMessageStep } from './steps/send-message.step';

/**
 * Runs an automation's steps for one contact.
 *
 * Instagram's rules shape the whole design:
 *  - After a comment we may send exactly ONE message (the "private reply").
 *  - After that we can only message someone who has written back, and only
 *    for 24 hours after their last message.
 *
 * So a flow started by a comment sends step 1 as the private reply and then
 * waits. Each time the follower replies, the engine sends the following
 * steps until it reaches one that needs an answer.
 */
@Injectable()
export class FlowEngineService {
  private readonly logger = new Logger(FlowEngineService.name);
  private readonly handlers = new Map<StepType, FlowStep>();

  constructor(
    private readonly state: FlowStateService,
    @InjectQueue(QUEUES.PRIVATE_REPLY) private readonly privateReplies: Queue<PrivateReplyJob>,
    @InjectQueue(QUEUES.DM) private readonly dms: Queue<DmJob>,
    sendMessage: SendMessageStep,
    quickReplies: QuickRepliesStep,
    followGate: FollowGateStep,
    collectInput: CollectInputStep,
  ) {
    for (const handler of [sendMessage, quickReplies, followGate, collectInput]) {
      for (const type of handler.types) this.handlers.set(type, handler);
    }
  }

  private handlerFor(step: AutomationStep): FlowStep {
    const handler = this.handlers.get(step.type);
    if (!handler) throw new Error(`No handler for step type ${step.type}`);
    return handler;
  }

  /** A comment matched: send step 1 as the private reply, then wait for the follower. */
  async startFromComment(params: {
    account: InstagramAccount;
    contact: Contact;
    automation: AutomationWithSteps;
    commentId: string;
  }): Promise<void> {
    const { account, contact, automation, commentId } = params;
    const first = automation.steps[0];
    if (!first) return;

    await this.privateReplies.add(
      JOBS.SEND_PRIVATE_REPLY,
      {
        igAccountId: account.id,
        contactId: contact.id,
        automationId: automation.id,
        commentId,
        // A private reply is text only; buttons arrive once the follower writes back.
        message: this.handlerFor(first).prompt(first).text,
      },
      { jobId: `pr-${commentId}` },
    );

    const isOnlyMessage = automation.steps.length === 1 && first.type === 'SEND_MESSAGE';
    await this.state.start(contact.id, automation.id, isOnlyMessage ? 'DONE' : 'WAITING_INPUT');
  }

  /** A DM or story reply matched: the 24h window is open, so run from step 1. */
  async startFromMessage(params: {
    account: InstagramAccount;
    contact: Contact;
    automation: AutomationWithSteps;
  }): Promise<void> {
    const { account, contact, automation } = params;
    const state = await this.state.start(contact.id, automation.id, 'ACTIVE');
    await this.runFrom(state.id, account, contact, automation, 0);
  }

  /**
   * The follower wrote to us. If a flow is waiting on them, feed it the reply.
   * Returns false when there was nothing waiting, so the caller can try keywords.
   */
  async resume(account: InstagramAccount, contact: Contact, text: string): Promise<boolean> {
    const waiting = await this.state.findWaiting(contact.id);
    if (!waiting) return false;

    const { automation } = waiting;
    const step = automation.steps[waiting.currentStep];
    if (!step) {
      await this.state.update(waiting.id, { status: 'DONE' });
      return false;
    }

    const result = await this.handlerFor(step).onReply({ account, contact, step, text });
    if (result.outcome === 'retry') {
      await this.sendDm(account, contact, automation.id, result.message);
      await this.state.update(waiting.id, { status: 'WAITING_INPUT' });
      return true;
    }
    await this.runFrom(waiting.id, account, contact, automation, waiting.currentStep + 1);
    return true;
  }

  /** Sends steps starting at `index` until one needs an answer or the flow ends. */
  private async runFrom(
    stateId: string,
    account: InstagramAccount,
    contact: Contact,
    automation: AutomationWithSteps,
    index: number,
  ): Promise<void> {
    for (let i = index; i < automation.steps.length; i++) {
      const step = automation.steps[i] as AutomationStep;
      const handler = this.handlerFor(step);
      await this.sendDm(account, contact, automation.id, handler.prompt(step));
      if (handler.waitsForReply) {
        await this.state.update(stateId, { currentStep: i, status: 'WAITING_INPUT' });
        return;
      }
    }
    await this.state.update(stateId, { status: 'DONE' });
    this.logger.debug(`Flow ${stateId} finished for contact ${contact.id}`);
  }

  private async sendDm(
    account: InstagramAccount,
    contact: Contact,
    automationId: string,
    message: OutgoingMessage,
  ): Promise<void> {
    await this.dms.add(JOBS.SEND_DM, {
      igAccountId: account.id,
      contactId: contact.id,
      automationId,
      recipientId: contact.igScopedUserId,
      message: message.text,
      quickReplies: message.quickReplies,
      askFor: message.askFor,
    });
  }
}
