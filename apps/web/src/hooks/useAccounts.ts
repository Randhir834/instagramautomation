'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet } from '@/lib/api';

export interface IgAccount {
  id: string;
  igUserId: string;
  username: string;
  isActive: boolean;
  tokenExpiresAt: string;
  connectedAt: string;
}

export interface IgMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  permalink?: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp?: string;
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiGet<IgAccount[]>('/instagram/accounts'),
  });
}

export function useMedia(accountId: string | undefined) {
  return useQuery({
    queryKey: ['media', accountId],
    queryFn: () => apiGet<IgMedia[]>(`/instagram/accounts/${accountId}/media`),
    enabled: Boolean(accountId),
    retry: false,
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/instagram/accounts/${id}`),
    // Disconnecting deletes automations and contacts too.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
