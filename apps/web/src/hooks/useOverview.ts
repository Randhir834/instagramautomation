'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

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

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiGet<OverviewCounts>('/analytics/overview'),
  });
}
