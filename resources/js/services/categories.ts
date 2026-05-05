import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Category } from '@/schemas/category';

class CategoryService extends ApiService<Category> {
    constructor() {
        super({ basePath: '/categories' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Category>> {
        return super.list(params);
    }

    async get(id: number): Promise<Category> {
        return super.get(id);
    }

    async create(data: Partial<Category>): Promise<Category> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Category>): Promise<Category> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async import(file: File): Promise<{ job_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/categories/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }
}

export const categoryService = new CategoryService();
