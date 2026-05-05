import { useQuery } from '@tanstack/react-query';
import {
    defaultWorkspaceNavigation,
    defaultWorkspaceQuickActions,
} from '@/constants/workspace';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { WorkspaceSeed } from '@/types/workspace';

export function useWorkspace() {
    const { data: currentUser } = useCurrentUser();

    return useQuery({
        queryKey: ['workspace'],
        queryFn: async (): Promise<WorkspaceSeed> => ({
            companies: [
                {
                    id: String(currentUser?.current_company?.id || 1),
                    name: currentUser?.current_company?.name || 'Minha empresa',
                    slug: 'minha-empresa',
                    role: 'admin',
                    initials: 'ME',
                    description: 'Empresa ativa no ambiente atual',
                    primaryColor: '#f97316',
                    secondaryColor: '#fb923c',
                },
            ],
            navigation: defaultWorkspaceNavigation,
            quickActions: defaultWorkspaceQuickActions,
        }),
        staleTime: Infinity,
    });
}
