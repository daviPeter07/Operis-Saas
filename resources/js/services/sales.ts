import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Sale } from '@/schemas/sale';
import { toNumber } from './normalizers';

function normalizeSale(sale: Sale): Sale {
    return {
        ...sale,
        subtotal: toNumber(sale.subtotal),
        total: toNumber(sale.total),
        items: sale.items?.map((item) => ({
            ...item,
            quantity: toNumber(item.quantity),
            unit_price: toNumber(item.unit_price),
            subtotal: toNumber(item.subtotal),
        })),
    };
}

class SaleService extends ApiService<Sale> {
    constructor() {
        super({ basePath: '/sales' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Sale>> {
        const response = await super.list(params);

        return {
            ...response,
            data: response.data.map(normalizeSale),
        };
    }

    async get(id: number): Promise<Sale> {
        const sale = await super.get(id);

        return normalizeSale(sale);
    }

    async create(data: Partial<Sale>): Promise<Sale> {
        const sale = await super.create(data);

        return normalizeSale(sale);
    }

    async update(id: number, data: Partial<Sale>): Promise<Sale> {
        const sale = await super.update(id, data);

        return normalizeSale(sale);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async cancel(id: number): Promise<{ success: boolean }> {
        const response = await apiClient.post<{ success: boolean }>(
            `/sales/${id}/cancel`,
            {},
        );

        return response.data;
    }
}

export const saleService = new SaleService();
