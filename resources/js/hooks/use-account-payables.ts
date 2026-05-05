import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountPayableService } from '@/services/account-payables';

export const accountPayablesQueryKey = ['account-payables'] as const;

type SettlePayload = {
    id: number;
    paid_at: string;
    paid_method: 'cash' | 'pix' | 'card' | 'installment';
    payment_notes?: string;
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
            await queryClient.invalidateQueries({
                queryKey: accountPayablesQueryKey,
            });
        },
    });
}
