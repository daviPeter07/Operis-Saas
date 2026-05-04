import {
    ApiService
    
    
} from '@/lib/apiService';
import type {ListParams, PaginatedData} from '@/lib/apiService';
import type { Customer } from '@/schemas/customer';

class CustomerService extends ApiService<Customer> {
    constructor() {
        super({ basePath: '/customers' });
    }

    async list(params?: ListParams): Promise<PaginatedData<Customer>> {
        return super.list(params);
    }

    async get(id: number): Promise<Customer> {
        return super.get(id);
    }

    async create(data: Partial<Customer>): Promise<Customer> {
        return super.create(data);
    }

    async update(id: number, data: Partial<Customer>): Promise<Customer> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<{ success: boolean }> {
        return super.delete(id);
    }

    async import(file: File): Promise<{ job_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/customers/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        return response.json();
    }
}

export const customerService = new CustomerService();
