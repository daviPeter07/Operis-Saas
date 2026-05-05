import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '@/services/brands';
import { brandsQueryKey } from '@/hooks/use-brands';

type UpdateBrandInput = {
    id: number;
    name: string;
    status: 'active' | 'inactive';
};

export function useUpdateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateBrandInput) =>
            brandService.update(payload.id, {
                name: payload.name,
                status: payload.status,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: brandsQueryKey });
        },
    });
}
