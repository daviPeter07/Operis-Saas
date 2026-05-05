import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categories';

export const categoriesQueryKey = ['categories'] as const;

type CreateCategoryInput = {
    name: string;
    status?: 'active' | 'inactive';
};

export function useCategories() {
    return useQuery({
        queryKey: categoriesQueryKey,
        queryFn: async () => {
            const response = await categoryService.list();

            return response.data;
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCategoryInput) =>
            categoryService.create({
                name: payload.name,
                status: payload.status ?? 'active',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: categoriesQueryKey,
            });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => categoryService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: categoriesQueryKey,
            });
        },
    });
}
