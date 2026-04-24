import { useQuery } from '@tanstack/react-query';
import { mockWorkspaceSeed } from '@/lib/mocks/workspace-mocks';
import type { WorkspaceSeed } from '@/types/workspace';

export function useWorkspace() {
    return useQuery({
        queryKey: ['workspace'],
        queryFn: async (): Promise<WorkspaceSeed> => mockWorkspaceSeed,
        staleTime: Infinity,
    });
}