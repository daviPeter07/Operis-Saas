import {
    ApiService
    
    
} from '@/lib/apiService';
import type {ListParams, PaginatedData} from '@/lib/apiService';
import type { Supplier } from '@/schemas/supplier';

class SupplierService extends ApiService<Supplier> {
    constructor() {
        super({ basePath: '/suppliers' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Supplier>> {
        return super.list(params);
    }

    async get(id: number): Promise<Supplier> {
        return super.get(id);
    }

    async create(data: Partial<Supplier>): Promise<Supplier> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async import(file: File): Promise<{ job_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/suppliers/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }
}

export const supplierService = new SupplierService();
