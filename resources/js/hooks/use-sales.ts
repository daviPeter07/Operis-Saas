import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saleService } from '@/services/sales';

export const salesQueryKey = ['sales'] as const;

export type SaleMutationInput = {
    customer_id: number | null;
    date: string;
    status?: 'pending' | 'completed';
    payment_method: 'cash' | 'pix' | 'card' | 'installment';
    items: Array<{
        product_id: number;
        quantity: number;
        unit_price: number;
    }>;
};

export function useSales() {
    return useQuery({
        queryKey: salesQueryKey,
        queryFn: async () => {
            const response = await saleService.list();

            return response.data;
        },
    });
}

export function useCreateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SaleMutationInput) =>
            saleService.create(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
        },
    });
}

export function useUpdateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: SaleMutationInput }) =>
            saleService.update(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
        },
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => saleService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
        },
    });
}
