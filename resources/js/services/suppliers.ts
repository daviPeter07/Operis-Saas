import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Supplier } from '@/schemas/supplier';

class SupplierService extends ApiService<Supplier> {
    constructor() {
        super({ basePath: '/suppliers' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Supplier>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Supplier>> {
        return super.get(id);
    }

    async create(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
        return super.create(data);
    }

    async update(
        id: number,
        data: Partial<Supplier>,
    ): Promise<ApiResponse<Supplier>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async import(file: File): Promise<ApiResponse<{ job_id: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/suppliers/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then((res) => res.json());
    }
}

export const supplierService = new SupplierService();
