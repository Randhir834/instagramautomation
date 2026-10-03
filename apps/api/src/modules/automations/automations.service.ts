import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateAutomationDto } from './dto/create-automation.dto';
import type { UpdateAutomationDto } from './dto/update-automation.dto';

const WITH_STEPS = {
  steps: { orderBy: { order: 'asc' } },
  igAccount: { select: { id: true, username: true } },
} satisfies Prisma.AutomationInclude;

type StepInput = CreateAutomationDto['steps'];

function toStepRows(steps: StepInput) {
  return steps.map((step, order) => ({
    order,
    type: step.type,
    payload: step.payload as Prisma.InputJsonValue,
  }));
}

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.automation.findMany({
      where: { igAccount: { userId } },
      include: WITH_STEPS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id, igAccount: { userId } },
      include: WITH_STEPS,
    });
    if (!automation) throw new NotFoundException('Automation not found');
    return automation;
  }

  async create(userId: string, dto: CreateAutomationDto) {
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: dto.igAccountId, userId },
      select: { id: true },
    });
    if (!account) throw new NotFoundException('Instagram account not found');

    const { steps, igAccountId, ...fields } = dto;
    return this.prisma.automation.create({
      data: { ...fields, igAccountId, steps: { create: toStepRows(steps) } },
      include: WITH_STEPS,
    });
  }

  async update(userId: string, id: string, dto: UpdateAutomationDto) {
    await this.get(userId, id);
    const { steps, ...fields } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (steps) {
        // Conversations in progress point at step positions, so end them
        // before the steps are replaced.
        await tx.flowState.updateMany({
          where: { automationId: id, status: { not: 'DONE' } },
          data: { status: 'DONE' },
        });
        await tx.automationStep.deleteMany({ where: { automationId: id } });
        await tx.automationStep.createMany({
          data: toStepRows(steps).map((row) => ({ ...row, automationId: id })),
        });
      }
      return tx.automation.update({ where: { id }, data: fields, include: WITH_STEPS });
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.get(userId, id);
    await this.prisma.automation.delete({ where: { id } });
  }
}
