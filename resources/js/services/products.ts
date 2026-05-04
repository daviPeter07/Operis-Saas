import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Product } from '@/schemas/product';

class ProductService extends ApiService<Product> {
    constructor() {
        super({ basePath: '/products' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Product>> {
        return super.list(params);
    }

    async get(id: number): Promise<Product> {
        return super.get(id);
    }

    async create(data: Partial<Product>): Promise<Product> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Product>): Promise<Product> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async import(file: File): Promise<{ job_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/products/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }
}

export const productService = new ProductService();
