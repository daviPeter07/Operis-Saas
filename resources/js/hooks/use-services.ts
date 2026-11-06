import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { salesQueryKey } from '@/hooks/use-sales';
import type { ServicePayload } from '@/schemas/service';
import { serviceService } from '@/services/services';

export const servicesQueryKey = ['services'] as const;

/** Every service (all pages), for the sale wizard catalog. */
export function useServices() {
    return useQuery({
        queryKey: servicesQueryKey,
        queryFn: async () => (await serviceService.list()).data,
    });
}

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ServicePayload) =>
            serviceService.create(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: servicesQueryKey });
        },
    });
}

export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: ServicePayload & { id: number }) =>
            serviceService.update(id, payload),
        onSuccess: async () => {
            // Sales show the service name.
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: servicesQueryKey }),
                queryClient.invalidateQueries({ queryKey: salesQueryKey }),
            ]);
        },
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => serviceService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: servicesQueryKey });
        },
    });
}
