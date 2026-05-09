import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesQueryKey } from '@/hooks/use-categories';
import { categoryService } from '@/services/categories';

type UpdateCategoryInput = {
    id: number;
    name: string;
    status: 'active' | 'inactive';
};

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateCategoryInput) =>
            categoryService.update(payload.id, {
                name: payload.name,
                status: payload.status,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: categoriesQueryKey,
            });
        },
    });
}
