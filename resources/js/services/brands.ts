import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Brand } from '@/schemas/brand';

class BrandService extends ApiService<Brand> {
    constructor() {
        super({ basePath: '/brands' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Brand>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Brand>> {
        return super.get(id);
    }

    async create(data: Partial<Brand>): Promise<ApiResponse<Brand>> {
        return super.create(data);
    }

    async update(
        id: number,
        data: Partial<Brand>,
    ): Promise<ApiResponse<Brand>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async import(file: File): Promise<ApiResponse<{ job_id: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/brands/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then((res) => res.json());
    }
}

export const brandService = new BrandService();
