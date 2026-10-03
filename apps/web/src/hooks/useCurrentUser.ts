'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile } from '@/lib/auth';

export function useCurrentUser() {
  return useQuery({ queryKey: ['me'], queryFn: getCurrentUser, retry: false });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => queryClient.setQueryData(['me'], user),
  });
}
