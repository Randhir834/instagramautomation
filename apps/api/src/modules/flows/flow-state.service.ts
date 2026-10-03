import { Injectable } from '@nestjs/common';
import type { Automation, AutomationStep, FlowState, FlowStatus } from '@prisma/client';
import { addHours } from '../../common/utils/dates';
import { PrismaService } from '../../prisma/prisma.service';

/** Flows expire with Meta's 24h messaging window. */
const FLOW_TTL_HOURS = 24;

export type WaitingFlow = FlowState & { automation: Automation & { steps: AutomationStep[] } };

/** Per-contact position inside an automation's steps. */
@Injectable()
export class FlowStateService {
  constructor(private readonly prisma: PrismaService) {}

  /** Starts a new flow for a contact, ending any they were already in. */
  async start(contactId: string, automationId: string, status: FlowStatus): Promise<FlowState> {
    const [, state] = await this.prisma.$transaction([
      this.prisma.flowState.updateMany({
        where: { contactId, status: { not: 'DONE' } },
        data: { status: 'DONE' },
      }),
      this.prisma.flowState.create({
        data: {
          contactId,
          automationId,
          currentStep: 0,
          status,
          expiresAt: addHours(new Date(), FLOW_TTL_HOURS),
        },
      }),
    ]);
    return state;
  }

  /** The flow currently waiting on this contact's reply, if any. */
  findWaiting(contactId: string): Promise<WaitingFlow | null> {
    return this.prisma.flowState.findFirst({
      where: {
        contactId,
        status: 'WAITING_INPUT',
        expiresAt: { gt: new Date() },
        automation: { isActive: true },
      },
      include: { automation: { include: { steps: { orderBy: { order: 'asc' } } } } },
      orderBy: { expiresAt: 'desc' },
    });
  }

  /** Moves the flow and pushes the expiry forward, since the follower just replied. */
  update(id: string, data: { currentStep?: number; status: FlowStatus }): Promise<FlowState> {
    return this.prisma.flowState.update({
      where: { id },
      data: { ...data, expiresAt: addHours(new Date(), FLOW_TTL_HOURS) },
    });
  }
}
