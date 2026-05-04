import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Product } from '@/schemas/product';

class ProductService extends ApiService<Product> {
    constructor() {
        super({ basePath: '/products' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Product>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Product>> {
        return super.get(id);
    }

    async create(data: Partial<Product>): Promise<ApiResponse<Product>> {
        return super.create(data);
    }

    async update(
        id: number,
        data: Partial<Product>,
    ): Promise<ApiResponse<Product>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async import(file: File): Promise<ApiResponse<{ job_id: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/products/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then((res) => res.json());
    }
}

export const productService = new ProductService();
