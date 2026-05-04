import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { User } from '@/schemas/user';

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async (): Promise<User> => {
            const response = await apiClient.get<{ data: User }>('/auth/me');

            return response.data.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
