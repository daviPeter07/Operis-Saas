import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountPayableService } from '@/services/account-payables';
import { productsQueryKey } from './use-products';
import { purchasesQueryKey } from './use-purchases';
import { salesQueryKey } from './use-sales';

export const accountPayablesQueryKey = ['account-payables'] as const;
const accountReceivablesQueryKey = ['account-receivables'] as const;
let payablesInvalidateTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleInvalidateRelatedQueries(queryClient: QueryClient): void {
    if (payablesInvalidateTimer) {
        clearTimeout(payablesInvalidateTimer);
    }

    payablesInvalidateTimer = setTimeout(() => {
        void invalidateRelatedQueries(queryClient);
        payablesInvalidateTimer = null;
    }, 150);
}

async function invalidateRelatedQueries(
    queryClient: QueryClient,
): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountPayablesQueryKey }),
        queryClient.invalidateQueries({ queryKey: purchasesQueryKey }),
        queryClient.invalidateQueries({ queryKey: productsQueryKey }),
        queryClient.invalidateQueries({ queryKey: salesQueryKey }),
        queryClient.invalidateQueries({ queryKey: accountReceivablesQueryKey }),
    ]);
}

type SettlePayload = {
    id: number;
    paid_at: string;
    paid_method: 'cash' | 'pix' | 'card' | 'installment';
    payment_notes?: string;
};

type PartialSettlePayload = {
    id: number;
    amount: number;
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
    boleto_term_days?: 30 | 60 | 90 | 120 | 150;
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
        onMutate: async (payload: SettlePayload) => {
            await queryClient.cancelQueries({ queryKey: accountPayablesQueryKey });

            const previous = queryClient.getQueryData<any>(accountPayablesQueryKey);

            if (previous?.data) {
                queryClient.setQueryData(accountPayablesQueryKey, {
                    ...previous,
                    data: previous.data.map((row: any) =>
                        row.id === payload.id
                            ? {
                                  ...row,
                                  status: 'paid',
                                  paid_at: payload.paid_at,
                                  paid_method: payload.paid_method,
                              }
                            : row,
                    ),
                });
            }

            return { previous };
        },
        onSuccess: () => {
            scheduleInvalidateRelatedQueries(queryClient);
        },
        onError: (_error, _payload, context) => {
            if (context?.previous) {
                queryClient.setQueryData(accountPayablesQueryKey, context.previous);
            }
        },
    });
}

export function useUnsettleAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountPayableService.unsettle(id),
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: accountPayablesQueryKey });

            const previous = queryClient.getQueryData<any>(accountPayablesQueryKey);

            if (previous?.data) {
                queryClient.setQueryData(accountPayablesQueryKey, {
                    ...previous,
                    data: previous.data.map((row: any) =>
                        row.id === id
                            ? {
                                  ...row,
                                  status: 'pending',
                                  paid_at: null,
                                  paid_method: null,
                              }
                            : row,
                    ),
                });
            }

            return { previous };
        },
        onSuccess: () => {
            scheduleInvalidateRelatedQueries(queryClient);
        },
        onError: (_error, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(accountPayablesQueryKey, context.previous);
            }
        },
    });
}

export function usePartialSettleAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: PartialSettlePayload) =>
            accountPayableService.partialSettle(payload.id, {
                amount: payload.amount,
                paid_at: payload.paid_at,
                paid_method: payload.paid_method,
                payment_notes: payload.payment_notes,
            }),
        onSuccess: () => {
            scheduleInvalidateRelatedQueries(queryClient);
        },
    });
}

export function useCreateManualAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateManualPayload) =>
            accountPayableService.create(payload),
        onSuccess: () => {
            void invalidateRelatedQueries(queryClient);
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
        onSuccess: () => {
            void invalidateRelatedQueries(queryClient);
        },
    });
}

export function useDeleteAccountPayable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountPayableService.delete(id),
        onSuccess: () => {
            void invalidateRelatedQueries(queryClient);
        },
        onError: () => {
            toast.error('Erro ao excluir conta a pagar.');
        },
    });
}
