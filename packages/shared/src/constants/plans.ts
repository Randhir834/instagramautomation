export const PLANS = ['FREE', 'TRIAL', 'PREMIUM', 'PROFESSIONAL'] as const;
export type PlanId = (typeof PLANS)[number];

export interface PlanLimits {
  /** Max active automations. `null` = unlimited. */
  maxAutomations: number | null;
  /** Max DMs per calendar month (UTC). `null` = unlimited. */
  maxDmsPerMonth: number | null;
}

// Premium/Professional numbers are placeholders until pricing is final.
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  FREE: { maxAutomations: 5, maxDmsPerMonth: 2_000 },
  TRIAL: { maxAutomations: 20, maxDmsPerMonth: 10_000 },
  PREMIUM: { maxAutomations: 50, maxDmsPerMonth: 25_000 },
  PROFESSIONAL: { maxAutomations: null, maxDmsPerMonth: null },
};

export function isWithinLimit(limit: number | null, used: number): boolean {
  return limit === null || used < limit;
}
