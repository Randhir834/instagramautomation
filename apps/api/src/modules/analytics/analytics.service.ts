import { Injectable } from '@nestjs/common';
import { PLAN_LIMITS } from '@repo/shared';
import { monthKey } from '../../common/utils/dates';
import { PrismaService } from '../../prisma/prisma.service';

export interface OverviewCounts {
  accounts: number;
  automations: number;
  contacts: number;
  leads: number;
  dmsThisMonth: number;
  dmLimit: number | null;
  paidOrders: number;
  revenueInPaise: number;
}

/** Basic counts only (full analytics is deferred, see spec section 8). */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string): Promise<OverviewCounts> {
    const mine = { igAccount: { userId } };
    const [user, accounts, automations, contacts, leads, usage, orders] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
      this.prisma.instagramAccount.count({ where: { userId, isActive: true } }),
      this.prisma.automation.count({ where: { ...mine, isActive: true } }),
      this.prisma.contact.count({ where: mine }),
      this.prisma.contact.count({
        where: { ...mine, OR: [{ email: { not: null } }, { phone: { not: null } }] },
      }),
      this.prisma.usageCounter.findUnique({
        where: { userId_month: { userId, month: monthKey() } },
      }),
      this.prisma.order.aggregate({
        where: { product: { userId }, status: 'PAID' },
        _count: true,
        _sum: { amountInPaise: true },
      }),
    ]);
    return {
      accounts,
      automations,
      contacts,
      leads,
      dmsThisMonth: usage?.dmCount ?? 0,
      dmLimit: PLAN_LIMITS[user?.plan ?? 'FREE'].maxDmsPerMonth,
      paidOrders: orders._count,
      revenueInPaise: orders._sum.amountInPaise ?? 0,
    };
  }
}
