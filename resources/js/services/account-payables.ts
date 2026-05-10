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

type CreateManualAccountPayablePayload = {
    supplier_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
    due_date: string;
    payment_method: 'cash' | 'pix' | 'card' | 'installment' | 'boleto';
    status: 'pending' | 'paid';
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

    async create(payload: CreateManualAccountPayablePayload): Promise<void> {
        await apiClient.post('/account-payables', payload);
    }
}

export const accountPayableService = new AccountPayableService();
