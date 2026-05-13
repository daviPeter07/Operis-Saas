import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountPayableService } from '@/services/account-payables';
import { productsQueryKey } from './use-products';
import { purchasesQueryKey } from './use-purchases';
import { salesQueryKey } from './use-sales';

export const accountPayablesQueryKey = ['account-payables'] as const;
const accountReceivablesQueryKey = ['account-receivables'] as const;

async function invalidateRelatedQueries(
    queryClient: QueryClient,
): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountPayablesQueryKey }),
        queryClient.invalidateQueries({ queryKey: purchasesQueryKey }),
        queryClient.invalidateQueries({ queryKey: productsQueryKey }),
        queryClient.invalidateQueries({ queryKey: salesQueryKey }),
        queryClient.invalidateQueries({ queryKey: accountReceivablesQueryKey }),
        queryClient.refetchQueries({ queryKey: accountPayablesQueryKey }),
        queryClient.refetchQueries({ queryKey: purchasesQueryKey }),
        queryClient.refetchQueries({ queryKey: productsQueryKey }),
        queryClient.refetchQueries({ queryKey: salesQueryKey }),
        queryClient.refetchQueries({ queryKey: accountReceivablesQueryKey }),
    ]);
}

type SettlePayload = {
    id: number;
    paid_at: string;
    paid_method: 'cash' | 'pix' | 'card' | 'installment';
    payment_notes?: string;
};

type CreateManualPayload = {
    supplier_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
    due_date: string;
    payment_method: 'cash' | 'pix' | 'card' | 'installment' | 'boleto';
    status: 'pending' | 'paid';
};

export function useAccountPayables() {
    return useQuery({
        queryKey: accountPayablesQueryKey,
        queryFn: async () => {
            const response = await accountPayableService.list();

            return response.data;
        },
    });
}

export function useSettleAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SettlePayload) =>
            accountPayableService.settle(payload.id, {
                paid_at: payload.paid_at,
                paid_method: payload.paid_method,
                payment_notes: payload.payment_notes,
            }),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useUnsettleAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountPayableService.unsettle(id),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useCreateManualAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateManualPayload) =>
            accountPayableService.create(payload),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useUpdateAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            id: number;
            data: CreateManualPayload;
        }) => accountPayableService.update(payload.id, payload.data),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useDeleteAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountPayableService.delete(id),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
        onError: () => {
            toast.error('Erro ao excluir conta a pagar.');
        },
    });
}
