import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { Customer } from '@/schemas/customer';

class CustomerService extends ApiService<Customer> {
    constructor() {
        super({ basePath: '/customers' });
    }

    async list(params?: ListParams): Promise<PaginatedResponse<Customer>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<Customer>> {
        return super.get(id);
    }

    async create(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
        return super.create(data);
    }

    async update(
        id: number,
        data: Partial<Customer>,
    ): Promise<ApiResponse<Customer>> {
        return super.update(id, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return super.delete(id);
    }

    async import(file: File): Promise<ApiResponse<{ job_id: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/customers/import', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then((res) => res.json());
    }
}

export const customerService = new CustomerService();
