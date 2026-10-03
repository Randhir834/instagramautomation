import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Plan, SubscriptionStatus } from '@prisma/client';
import { PLAN_LIMITS } from '@repo/shared';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import { UsageService } from './usage.service';

export type PaidPlan = 'PREMIUM' | 'PROFESSIONAL';

export interface RazorpaySubscriptionEntity {
  id?: string;
  status?: string;
  plan_id?: string;
  current_end?: number | null;
  notes?: Record<string, string> | unknown[];
}

const STATUSES: SubscriptionStatus[] = [
  'CREATED',
  'AUTHENTICATED',
  'ACTIVE',
  'PENDING',
  'HALTED',
  'CANCELLED',
  'COMPLETED',
  'EXPIRED',
];
/** Statuses in which the creator has paid access. */
const PAID_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'PENDING'];
const ENDED_STATUSES: SubscriptionStatus[] = ['HALTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'];

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
    private readonly razorpay: RazorpayService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private planIds(): Record<PaidPlan, string> {
    const rzp = this.config.get('razorpay', { infer: true });
    return { PREMIUM: rzp.planPremiumId, PROFESSIONAL: rzp.planProfessionalId };
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const [dmsThisMonth, automations, subscription] = await Promise.all([
      this.usage.getDmCount(userId),
      this.prisma.automation.count({ where: { igAccount: { userId } } }),
      this.prisma.subscription.findFirst({
        where: { userId, status: { in: ['AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED'] } },
        select: { plan: true, status: true, currentPeriodEnd: true },
        orderBy: { currentPeriodEnd: 'desc' },
      }),
    ]);
    const ids = this.planIds();
    return {
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      limits: PLAN_LIMITS[user.plan],
      usage: { dmsThisMonth, automations },
      subscription,
      /** Which paid plans can actually be bought on this server. */
      available: {
        PREMIUM: this.razorpay.isConfigured && Boolean(ids.PREMIUM),
        PROFESSIONAL: this.razorpay.isConfigured && Boolean(ids.PROFESSIONAL),
      },
    };
  }

  /** Creates a Razorpay subscription and returns what Checkout needs to open. */
  async subscribe(userId: string, plan: PaidPlan) {
    const planId = this.planIds()[plan];
    if (!this.razorpay.isConfigured || !planId) {
      throw new ServiceUnavailableException('This plan cannot be purchased yet.');
    }
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['AUTHENTICATED', 'ACTIVE', 'PENDING'] } },
    });
    if (existing) {
      throw new BadRequestException('You already have a subscription. Cancel it first to switch.');
    }

    const subscription = await this.razorpay.createSubscription(planId, { userId, plan });
    await this.prisma.subscription.create({
      data: { userId, razorpaySubscriptionId: subscription.id, plan, status: 'CREATED' },
    });
    return { subscriptionId: subscription.id, keyId: this.razorpay.keyId, plan };
  }

  /** Stops renewal. Access continues until the end of the period already paid for. */
  async cancel(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED'] } },
    });
    if (!subscription) throw new NotFoundException('No active subscription');
    await this.razorpay.cancelSubscription(subscription.razorpaySubscriptionId);
    return { cancelled: true, accessUntil: subscription.currentPeriodEnd };
  }

  /**
   * Applies a subscription webhook. The webhook, not the browser, is the
   * source of truth for what plan a user is on.
   */
  async applySubscriptionEvent(entity: RazorpaySubscriptionEntity): Promise<void> {
    if (!entity.id) return;
    const status = (entity.status ?? '').toUpperCase() as SubscriptionStatus;
    if (!STATUSES.includes(status)) {
      this.logger.warn(`Unknown subscription status "${entity.status}"`);
      return;
    }
    const currentPeriodEnd = entity.current_end ? new Date(entity.current_end * 1000) : null;

    let subscription = await this.prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: entity.id },
    });
    if (!subscription) {
      // Created outside our checkout (or our row was lost): rebuild it from the notes.
      const notes = Array.isArray(entity.notes)
        ? {}
        : ((entity.notes ?? {}) as Record<string, string>);
      const ids = this.planIds();
      const plan = (Object.keys(ids) as PaidPlan[]).find((p) => ids[p] === entity.plan_id);
      const user = notes.userId
        ? await this.prisma.user.findUnique({ where: { id: notes.userId }, select: { id: true } })
        : null;
      if (!user || !plan) {
        this.logger.warn(`Subscription ${entity.id} does not match a user/plan; ignored`);
        return;
      }
      subscription = await this.prisma.subscription.create({
        data: { userId: user.id, razorpaySubscriptionId: entity.id, plan, status: 'CREATED' },
      });
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status, ...(currentPeriodEnd ? { currentPeriodEnd } : {}) },
    });

    const periodEnd = currentPeriodEnd ?? subscription.currentPeriodEnd;
    if (PAID_STATUSES.includes(status)) {
      await this.setPlan(subscription.userId, subscription.plan, periodEnd);
    } else if (ENDED_STATUSES.includes(status)) {
      // Keep access until the paid period runs out; PlanExpiryCron downgrades after that.
      if (!periodEnd || periodEnd <= new Date()) {
        await this.setPlan(subscription.userId, 'FREE', null);
      } else {
        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: { planExpiresAt: periodEnd },
        });
      }
    }
  }

  /** Downgrades users whose paid period has ended and who have no live subscription. */
  async expireEndedPlans(): Promise<number> {
    const result = await this.prisma.user.updateMany({
      where: {
        plan: { not: 'FREE' },
        planExpiresAt: { lt: new Date() },
        subscriptions: { none: { status: { in: PAID_STATUSES } } },
      },
      data: { plan: 'FREE', planExpiresAt: null },
    });
    return result.count;
  }

  private async setPlan(userId: string, plan: Plan, planExpiresAt: Date | null): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { plan, planExpiresAt } });
  }
}
