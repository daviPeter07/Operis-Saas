import { apiClient } from '@/lib/apiClient';
import {
    ApiService
    
    
} from '@/lib/apiService';
import type {ListParams, PaginatedData} from '@/lib/apiService';
import type { Purchase } from '@/schemas/purchase';

class PurchaseService extends ApiService<Purchase> {
    constructor() {
        super({ basePath: '/purchases' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Purchase>> {
        return super.list(params);
    }

    async get(id: number): Promise<Purchase> {
        return super.get(id);
    }

    async create(data: Partial<Purchase>): Promise<Purchase> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Purchase>): Promise<Purchase> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async cancel(id: number): Promise<{ success: boolean }> {
        const response = await apiClient.post<{ data: { success: boolean } }>(
            `/purchases/${id}/cancel`,
            {},
        );

        return response.data;
    }
}

export const purchaseService = new PurchaseService();
