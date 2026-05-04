import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Sale } from '@/schemas/sale';

class SaleService extends ApiService<Sale> {
    constructor() {
        super({ basePath: '/sales' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Sale>> {
        return super.list(params);
    }

    async get(id: number): Promise<Sale> {
        return super.get(id);
    }

    async create(data: Partial<Sale>): Promise<Sale> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Sale>): Promise<Sale> {
        return super.update(id, data);
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
