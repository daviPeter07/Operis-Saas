import { useQuery } from '@tanstack/react-query';
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
