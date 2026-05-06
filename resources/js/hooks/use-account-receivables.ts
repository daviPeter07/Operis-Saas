import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountReceivableService } from '@/services/account-receivables';

export const accountReceivablesQueryKey = ['account-receivables'] as const;

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
            await queryClient.invalidateQueries({
                queryKey: accountReceivablesQueryKey,
            });
        },
    });
}
