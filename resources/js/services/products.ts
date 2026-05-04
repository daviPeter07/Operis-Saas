import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { Product } from '@/schemas/product';
import { toNumber } from './normalizers';

function normalizeProduct(product: Product): Product {
    return {
        ...product,
        sale_price: toNumber(product.sale_price),
        cost: toNumber(product.cost),
        stock: toNumber(product.stock),
        min_stock: toNumber(product.min_stock),
    };
}

class ProductService extends ApiService<Product> {
    constructor() {
        super({ basePath: '/products' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Product>> {
        const response = await super.list(params);

        return {
            ...response,
            data: response.data.map(normalizeProduct),
        };
    }

    async get(id: number): Promise<Product> {
        const product = await super.get(id);

        return normalizeProduct(product);
    }

    async create(data: Partial<Product>): Promise<Product> {
        const product = await super.create(data);

        return normalizeProduct(product);
    }

    async update(id: number, data: Partial<Product>): Promise<Product> {
        const product = await super.update(id, data);

        return normalizeProduct(product);
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
