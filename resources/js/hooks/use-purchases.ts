import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Purchase } from '@/schemas/purchase';
import { purchaseService } from '@/services/purchases';

export const purchasesQueryKey = ['purchases'] as const;

type CreatePurchaseInput = {
    supplier_id: number | null;
    date: string;
    due_date?: string;
    status?: 'pending' | 'completed';
    payment_method: 'cash' | 'pix' | 'card' | 'installment';
    update_product_cost?: boolean;
    items: Array<{
        product_id: number;
        quantity: number;
        unit_cost: number;
    }>;
};

export function usePurchases() {
    return useQuery({
        queryKey: purchasesQueryKey,
        queryFn: async () => {
            const response = await purchaseService.list();

            return response.data;
        },
    });
}

export function useCreatePurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePurchaseInput) =>
            purchaseService.create(payload as unknown as Partial<Purchase>),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: purchasesQueryKey,
            });
        },
    });
}

export function useDeletePurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => purchaseService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: purchasesQueryKey,
            });
        },
    });
}
