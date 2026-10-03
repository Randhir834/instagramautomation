'use client';

import type { Paginated } from '@repo/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet } from '@/lib/api';

export interface Contact {
  id: string;
  igAccountId: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  lastInteractionAt: string;
  createdAt: string;
}

export function useContacts(params: { page: number; search: string }) {
  const query = new URLSearchParams({ page: String(params.page) });
  if (params.search) query.set('search', params.search);
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => apiGet<Paginated<Contact>>(`/contacts?${query.toString()}`),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/contacts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
