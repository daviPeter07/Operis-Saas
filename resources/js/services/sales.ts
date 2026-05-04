import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Sale } from '@/schemas/sale';

class SaleService extends ApiService<Sale> {
    constructor() {
        super({ basePath: '/sales' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Sale>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Sale>> {
        return super.get(id);
    }

    async create(data: Partial<Sale>): Promise<ApiResponse<Sale>> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Sale>): Promise<ApiResponse<Sale>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async cancel(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return apiClient.post<ApiResponse<{ success: boolean }>>(
            `/sales/${id}/cancel`,
            {},
        );
    }
}

export const saleService = new SaleService();