import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Brand } from '@/schemas/brand';

class BrandService extends ApiService<Brand> {
    constructor() {
        super({ basePath: '/brands' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Brand>> {
        return super.list(params);
    }

    async get(id: number): Promise<Brand> {
        return super.get(id);
    }

    async create(data: Partial<Brand>): Promise<Brand> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Brand>): Promise<Brand> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async import(file: File): Promise<{ job_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/brands/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }
}

export const brandService = new BrandService();
