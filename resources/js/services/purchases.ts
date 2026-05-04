import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Purchase } from '@/schemas/purchase';

class PurchaseService extends ApiService<Purchase> {
    constructor() {
        super({ basePath: '/purchases' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Purchase>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Purchase>> {
        return super.get(id);
    }

    async create(data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async cancel(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return apiClient.post<ApiResponse<{ success: boolean }>>(`/purchases/${id}/cancel`, {});
    }
}

export const purchaseService = new PurchaseService();