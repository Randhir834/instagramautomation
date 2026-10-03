'use client';

import type { CreateInvoiceInput, InvoiceItem, InvoiceStatus } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';

export interface InvoiceRow {
  id: string;
  number: string;
  clientName: string;
  currency: string;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
}

/** Shape returned by the public and owner invoice endpoints. */
export interface InvoiceView {
  id: string;
  number: string;
  clientName: string;
  sellerName: string;
  items: InvoiceItem[];
  currency: string;
  taxPercent: number;
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
}

const KEY = ['invoices'] as const;

export function useInvoices() {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<InvoiceRow[]>('/invoices') });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) =>
      apiPost<{ id: string; number: string }>('/invoices', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      apiPatch(`/invoices/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
