'use client';

import type { CreateProductInput } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';

export interface Product {
  id: string;
  title: string;
  description: string;
  priceInPaise: number;
  coverImageUrl: string | null;
  slug: string;
  isPublished: boolean;
  _count?: { orders: number };
}

export interface Order {
  id: string;
  buyerEmail: string;
  buyerName: string | null;
  amountInPaise: number;
  status: 'CREATED' | 'PAID' | 'FAILED';
  createdAt: string;
  product: { id: string; title: string };
}

const KEY = ['products'] as const;

export function useProducts() {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<Product[]>('/store/products') });
}

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => apiGet<Order[]>('/store/orders') });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => apiPost<Product>('/store/products', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetPublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiPatch<Product>(`/store/products/${id}`, { isPublished }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/store/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

/**
 * Uploads a file straight to storage: asks the API for a one-time URL, then
 * PUTs the file to it. Returns the key to save on the product.
 */
export async function uploadFile(kind: 'file' | 'cover', file: File): Promise<string> {
  const { key, uploadUrl } = await apiPost<{ key: string; uploadUrl: string }>('/store/uploads', {
    kind,
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
  });
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new Error('The upload failed. Please try again.');
  return key;
}
