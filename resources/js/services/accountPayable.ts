import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { AccountPayable } from '@/schemas/accountPayable';

class AccountPayableService extends ApiService<AccountPayable> {
    constructor() {
        super({ basePath: '/account-payables' });
    }

    async list(params?: ListParams): Promise<PaginatedData<AccountPayable>> {
        return super.list(params);
    }

    async get(id: number): Promise<AccountPayable> {
        return super.get(id);
    }

    async settle(
        id: number,
        data: { paid_method: string; payment_notes?: string },
    ): Promise<{ success: boolean }> {
        const response = await apiClient.post<{ success: boolean }>(
            `/account-payables/${id}/settle`,
            data,
        );

        return response.data;
    }
}

export const accountPayableService = new AccountPayableService();
