import { useQuery } from '@tanstack/react-query';
import { saleService } from '@/services/sales';

export const salesQueryKey = ['sales'] as const;

export function useSales() {
    return useQuery({
        queryKey: salesQueryKey,
        queryFn: async () => {
            const response = await saleService.list();

            return response.data;
        },
    });
}
