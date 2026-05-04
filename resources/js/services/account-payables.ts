import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { AccountPayable } from '@/schemas/accountPayable';

type SettleAccountPayablePayload = {
    paid_at: string;
    paid_method: 'cash' | 'pix' | 'card' | 'installment';
    payment_notes?: string;
};

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
        payload: SettleAccountPayablePayload,
    ): Promise<AccountPayable> {
        const response = await apiClient.post<{ data: AccountPayable }>(
            `/account-payables/${id}/settle`,
            payload,
        );

        return response.data.data;
    }
}

export const accountPayableService = new AccountPayableService();
