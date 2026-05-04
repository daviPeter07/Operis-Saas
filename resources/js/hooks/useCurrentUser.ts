import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { User } from '@/schemas/user';

export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: () => apiClient.get<User>('/auth/me'),
        staleTime: 1000 * 60 * 5,
    });
}