import type { Sale } from '@/types/api';

export interface UseSalesOptions {
    page?: number;
    perPage?: number;
}

export function salesQueryKey(options: UseSalesOptions = {}) {
    return ['sales', options] as const;
}

export function useSalesQuery(options: UseSalesOptions = {}) {
    return {
        queryKey: salesQueryKey(options),
        queryFn: async () => {
            // TODO: Substituir por chamada real quando backend existir
            // import { index } from '@/actions/App/Http/Controllers/SaleController';
            // const response = await index({ query: { page: options.page, per_page: options.perPage } });
            // return response.json() as Promise<{ data: Sale[]; meta: PaginationMeta }>;

            const { mockSales } = await import('@/lib/mocks/mock-data');
            return {
                data: mockSales,
                meta: { total: mockSales.length, page: 1, perPage: 25 },
            };
        },
    };
}

export function useSaleMutation() {
    return {
        mutationFn: async (data: Partial<Sale>) => {
            // TODO: Substituir por chamada real
            // import { store } from '@/actions/App/Http/Controllers/SaleController';
            // await store.post(data);

            return { id: crypto.randomUUID(), ...data };
        },
    };
}

export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    lastPage?: number;
}
