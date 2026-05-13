import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountReceivableService } from '@/services/account-receivables';
import { productsQueryKey } from './use-products';
import { salesQueryKey } from './use-sales';

export const accountReceivablesQueryKey = ['account-receivables'] as const;

type SettlePayload = {
    id: number;
    received_at: string;
};

async function invalidateRelatedQueries(
    queryClient: QueryClient,
): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountReceivablesQueryKey }),
        queryClient.invalidateQueries({ queryKey: salesQueryKey }),
        queryClient.invalidateQueries({ queryKey: productsQueryKey }),
    ]);
}

export function useAccountReceivables() {
    return useQuery({
        queryKey: accountReceivablesQueryKey,
        queryFn: async () => {
            const response = await accountReceivableService.list();

            return response.data;
        },
    });
}

type CreateManualReceivableInput = {
    customer_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
};

export function useCreateManualAccountReceivable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateManualReceivableInput) =>
            accountReceivableService.createManual(payload),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useUpdateAccountReceivable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            id: number;
            data: CreateManualReceivableInput;
        }) => accountReceivableService.update(payload.id, payload.data),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useSettleAccountReceivable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SettlePayload) =>
            accountReceivableService.settle(payload.id, {
                received_at: payload.received_at,
            }),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useUnsettleAccountReceivable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountReceivableService.unsettle(id),
        onSuccess: async () => {
            await invalidateRelatedQueries(queryClient);
        },
    });
}

export function useDeleteAccountReceivable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => accountReceivableService.delete(id),
        // Optimistically remove the deleted receivable from the cache
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({
                queryKey: accountReceivablesQueryKey,
            });
            const previous = queryClient.getQueryData<any>(
                accountReceivablesQueryKey,
            );

            if (previous?.data) {
                queryClient.setQueryData(accountReceivablesQueryKey, {
                    ...previous,
                    data: previous.data.filter((r: any) => r.id !== id),
                });
            }

            return { previous };
        },
        onError: (err, id, context) => {
            // Revert cache on error
            if (context?.previous) {
                queryClient.setQueryData(
                    accountReceivablesQueryKey,
                    context.previous,
                );
            }

            toast.error('Erro ao deletar conta a receber');
        },
        onSuccess: async () => {
            // Ensure fresh data from server
            await queryClient.invalidateQueries({
                queryKey: accountReceivablesQueryKey,
            });
            toast.success('Conta a receber deletada com sucesso');
        },
    });
}
