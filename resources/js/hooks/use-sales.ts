import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Sale } from '@/schemas/sale';
import { saleService } from '@/services/sales';

export const salesQueryKey = ['sales'] as const;

type CreateSaleInput = {
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
        mutationFn: async (payload: CreateSaleInput) =>
            saleService.create(payload as unknown as Partial<Sale>),
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
