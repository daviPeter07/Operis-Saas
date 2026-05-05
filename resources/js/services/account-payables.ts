import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { AccountPayable } from '@/schemas/accountPayable';
import { toNumber } from './normalizers';

type SettleAccountPayablePayload = {
    paid_at: string;
    paid_method: 'cash' | 'pix' | 'card' | 'installment';
    payment_notes?: string;
};

function normalizeAccountPayable(accountPayable: AccountPayable): AccountPayable {
    return {
        ...accountPayable,
        amount: toNumber(accountPayable.amount),
    };
}

class AccountPayableService extends ApiService<AccountPayable> {
    constructor() {
        super({ basePath: '/account-payables' });
    }

    async list(params?: ListParams): Promise<PaginatedData<AccountPayable>> {
        const response = await super.list(params);

        return {
            ...response,
            data: response.data.map(normalizeAccountPayable),
        };
    }

    async get(id: number): Promise<AccountPayable> {
        const accountPayable = await super.get(id);

        return normalizeAccountPayable(accountPayable);
    }

    async settle(
        id: number,
        payload: SettleAccountPayablePayload,
    ): Promise<AccountPayable> {
        const response = await apiClient.post<AccountPayable>(
            `/account-payables/${id}/settle`,
            payload,
        );

        return normalizeAccountPayable(response.data);
    }
}

export const accountPayableService = new AccountPayableService();
