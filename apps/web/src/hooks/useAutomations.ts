'use client';

import type { MatchType, StepType, TriggerType } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';

export interface AutomationStep {
  id: string;
  order: number;
  type: StepType;
  payload: Record<string, unknown>;
}

export interface Automation {
  id: string;
  igAccountId: string;
  name: string;
  isActive: boolean;
  triggerType: TriggerType;
  postId: string | null;
  keywords: string[];
  matchType: MatchType;
  publicReplies: string[];
  createdAt: string;
  steps: AutomationStep[];
  igAccount: { id: string; username: string };
}

/** What the builder form sends. Validated again on the server. */
export interface AutomationPayload {
  igAccountId?: string;
  name?: string;
  isActive?: boolean;
  triggerType?: TriggerType;
  postId?: string | null;
  keywords?: string[];
  matchType?: MatchType;
  publicReplies?: string[];
  steps?: { type: StepType; payload: Record<string, unknown> }[];
}

const KEY = ['automations'] as const;

export function useAutomations() {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<Automation[]>('/automations') });
}

export function useAutomation(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => apiGet<Automation>(`/automations/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveAutomation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AutomationPayload) =>
      id
        ? apiPatch<Automation>(`/automations/${id}`, input)
        : apiPost<Automation>('/automations', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiPatch<Automation>(`/automations/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/automations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
