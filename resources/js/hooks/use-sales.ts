import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsQueryKey } from '@/hooks/use-products';
import { customersQueryKey } from '@/hooks/use-customers';
import type { Sale } from '@/schemas/sale';
import { saleService } from '@/services/sales';

export const salesQueryKey = ['sales'] as const;
export const receivablesQueryKey = ['account-receivables'] as const;

export type SaleMutationInput = {
    customer_id: number | null;
    date: string;
    status?: 'pending' | 'completed';
    payment_method:
        | 'cash'
        | 'pix'
        | 'card_debit'
        | 'card_credit'
        | 'crediario';
    installments?: number;
    first_installment_date?: string;
    installment_value?: number;
    crediario_entry?: number;
    paid_installments?: number[];
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
        mutationFn: async (data: SaleMutationInput) =>
            saleService.create(data as unknown as Partial<Sale>),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
            await queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
            await queryClient.invalidateQueries({ queryKey: customersQueryKey });
        },
    });
}

export function useUpdateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: SaleMutationInput }) =>
            saleService.update(id, data as Partial<Sale>),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
            await queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
            await queryClient.invalidateQueries({ queryKey: customersQueryKey });
        },
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => saleService.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: salesQueryKey });
            await queryClient.invalidateQueries({ queryKey: receivablesQueryKey });
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
            await queryClient.invalidateQueries({ queryKey: customersQueryKey });
        },
    });
}
