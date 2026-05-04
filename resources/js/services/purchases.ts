import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Purchase } from '@/schemas/purchase';
import { toNumber } from './normalizers';

function normalizePurchase(purchase: Purchase): Purchase {
    return {
        ...purchase,
        total: toNumber(purchase.total),
        items: purchase.items?.map((item) => ({
            ...item,
            quantity: toNumber(item.quantity),
            unit_cost: toNumber(item.unit_cost),
            subtotal: toNumber(item.subtotal),
        })),
    };
}

class PurchaseService extends ApiService<Purchase> {
    constructor() {
        super({ basePath: '/purchases' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Purchase>> {
        const response = await super.list(params);

        return {
            ...response,
            data: response.data.map(normalizePurchase),
        };
    }

    async get(id: number): Promise<Purchase> {
        const purchase = await super.get(id);

        return normalizePurchase(purchase);
    }

    async create(data: Partial<Purchase>): Promise<Purchase> {
        const purchase = await super.create(data);

        return normalizePurchase(purchase);
    }

    async update(id: number, data: Partial<Purchase>): Promise<Purchase> {
        const purchase = await super.update(id, data);

        return normalizePurchase(purchase);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async cancel(id: number): Promise<{ success: boolean }> {
        const response = await apiClient.post<{ success: boolean }>(
            `/purchases/${id}/cancel`,
            {},
        );

        return response.data;
    }
}

export const purchaseService = new PurchaseService();
