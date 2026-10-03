import { Injectable } from '@nestjs/common';
import { isWithinLimit, PLAN_LIMITS } from '@repo/shared';
import { monthKey } from '../../common/utils/dates';
import { PrismaService } from '../../prisma/prisma.service';

/** Monthly DM counters per user (UsageCounter table). */
@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async getDmCount(userId: string, month: string = monthKey()): Promise<number> {
    const counter = await this.prisma.usageCounter.findUnique({
      where: { userId_month: { userId, month } },
    });
    return counter?.dmCount ?? 0;
  }

  /** Atomic increment; creates the month's row on first send. */
  async incrementDm(userId: string, by = 1): Promise<number> {
    const month = monthKey();
    const counter = await this.prisma.usageCounter.upsert({
      where: { userId_month: { userId, month } },
      create: { userId, month, dmCount: by },
      update: { dmCount: { increment: by } },
    });
    return counter.dmCount;
  }

  /** True if the user's plan still allows another DM this month. */
  async canSendDm(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) return false;
    return isWithinLimit(PLAN_LIMITS[user.plan].maxDmsPerMonth, await this.getDmCount(userId));
  }
}
