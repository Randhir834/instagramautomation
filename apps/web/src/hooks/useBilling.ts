'use client';

import type { PlanId, PlanLimits } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export type PaidPlan = 'PREMIUM' | 'PROFESSIONAL';

export interface BillingSummary {
  plan: PlanId;
  planExpiresAt: string | null;
  limits: PlanLimits;
  usage: { dmsThisMonth: number; automations: number };
  subscription: { plan: PlanId; status: string; currentPeriodEnd: string | null } | null;
  available: Record<PaidPlan, boolean>;
}

export function useBilling() {
  return useQuery({ queryKey: ['billing'], queryFn: () => apiGet<BillingSummary>('/billing') });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (plan: PaidPlan) =>
      apiPost<{ subscriptionId: string; keyId: string; plan: PaidPlan }>('/billing/subscribe', {
        plan,
      }),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPost<{ cancelled: boolean; accessUntil: string | null }>('/billing/cancel'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing'] }),
  });
}
