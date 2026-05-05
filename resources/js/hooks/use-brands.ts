import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandService } from '@/services/brands';

export const brandsQueryKey = ['brands'] as const;

type CreateBrandInput = {
    name: string;
    status?: 'active' | 'inactive';
};

export function useBrands() {
    return useQuery({
        queryKey: brandsQueryKey,
        queryFn: async () => {
            const response = await brandService.list();

            return response.data;
        },
    });
}

export function useCreateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateBrandInput) =>
            brandService.create({
                name: payload.name,
                status: payload.status ?? 'active',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: brandsQueryKey });
        },
    });
}

export function useDeleteBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => brandService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: brandsQueryKey });
        },
    });
}
