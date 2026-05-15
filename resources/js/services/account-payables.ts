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

type PartialSettleAccountPayablePayload = {
    amount: number;
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

function normalizeAccountPayable(
    accountPayable: AccountPayable,
): AccountPayable {
    return {
        ...accountPayable,
        amount: toNumber(accountPayable.amount),
        amount_paid: toNumber(accountPayable.amount_paid),
        remaining_balance: toNumber(accountPayable.remaining_balance),
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

    async unsettle(id: number): Promise<AccountPayable> {
        const response = await apiClient.post<AccountPayable>(
            `/account-payables/${id}/unsettle`,
            {},
        );

        return normalizeAccountPayable(response.data);
    }

    async partialSettle(
        id: number,
        payload: PartialSettleAccountPayablePayload,
    ): Promise<AccountPayable> {
        const response = await apiClient.post<AccountPayable>(
            `/account-payables/${id}/partial-settle`,
            payload,
        );

        return normalizeAccountPayable(response.data);
    }

    async create(payload: CreateManualAccountPayablePayload): Promise<void> {
        await apiClient.post('/account-payables', payload);
    }

    async update(
        id: number,
        payload: CreateManualAccountPayablePayload,
    ): Promise<AccountPayable> {
        const response = await apiClient.put<AccountPayable>(
            `/account-payables/${id}`,
            payload,
        );

        return normalizeAccountPayable(response.data);
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/account-payables/${id}`);
    }
}

export const accountPayableService = new AccountPayableService();
