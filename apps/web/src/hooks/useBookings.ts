'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/api';

export interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  note: string | null;
  status: 'CONFIRMED' | 'CANCELLED';
  slot: { id: string; startsAt: string; endsAt: string };
}

export function useSlots() {
  return useQuery({ queryKey: ['slots'], queryFn: () => apiGet<Slot[]>('/bookings/slots') });
}

export function useBookings() {
  return useQuery({ queryKey: ['bookings'], queryFn: () => apiGet<Booking[]>('/bookings') });
}

function useInvalidateBookings() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['slots'] }),
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
    ]);
}

export function useCreateSlots() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (slots: { startsAt: string; endsAt: string }[]) =>
      apiPost<Slot[]>('/bookings/slots', { slots }),
    onSuccess: invalidate,
  });
}

export function useDeleteSlot() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/bookings/slots/${id}`),
    onSuccess: invalidate,
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: string) => apiPost<void>(`/bookings/${id}/cancel`),
    onSuccess: invalidate,
  });
}
