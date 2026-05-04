import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Category } from '@/schemas/category';

class CategoryService extends ApiService<Category> {
    constructor() {
        super({ basePath: '/categories' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Category>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Category>> {
        return super.get(id);
    }

    async create(data: Partial<Category>): Promise<ApiResponse<Category>> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async import(file: File): Promise<ApiResponse<{ job_id: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/categories/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then(res => res.json());
    }
}

export const categoryService = new CategoryService();