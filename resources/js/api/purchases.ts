import type { Purchase } from '@/types/api';

export interface UsePurchasesOptions {
    page?: number;
    perPage?: number;
}

export function purchasesQueryKey(options: UsePurchasesOptions = {}) {
    return ['purchases', options] as const;
}

export function usePurchasesQuery(options: UsePurchasesOptions = {}) {
    return {
        queryKey: purchasesQueryKey(options),
        queryFn: async () => {
            const { mockPurchases } = await import('@/lib/mocks/mock-data');
            return { data: mockPurchases, meta: { total: mockPurchases.length, page: 1, perPage: 25 } };
        },
    };
}

export function usePurchaseMutation() {
    return {
        mutationFn: async (data: Partial<Purchase>) => {
            return { id: crypto.randomUUID(), ...data };
        },
    };
}