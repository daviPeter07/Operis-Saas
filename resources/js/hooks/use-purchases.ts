import { useQuery } from '@tanstack/react-query';
import { purchaseService } from '@/services/purchases';

export const purchasesQueryKey = ['purchases'] as const;

export function usePurchases() {
    return useQuery({
        queryKey: purchasesQueryKey,
        queryFn: async () => {
            const response = await purchaseService.list();

            return response.data;
        },
    });
}
