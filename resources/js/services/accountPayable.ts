import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { AccountPayable } from '@/schemas/accountPayable';

class AccountPayableService extends ApiService<AccountPayable> {
    constructor() {
        super({ basePath: '/account-payables' });
    }

    async list(
        params?: ListParams,
    ): Promise<PaginatedResponse<AccountPayable>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<AccountPayable>> {
        return super.get(id);
    }

    async settle(
        id: number,
        data: { paid_method: string; payment_notes?: string },
    ): Promise<ApiResponse<{ success: boolean }>> {
        return apiClient.post<ApiResponse<{ success: boolean }>>(
            `/account-payables/${id}/settle`,
            data,
        );
    }
}

export const accountPayableService = new AccountPayableService();
