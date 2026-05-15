import { apiClient } from '@/lib/apiClient';
import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import { toNumber } from './normalizers';

type CreateManualAccountReceivableInput = {
    customer_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
};

type SettleAccountReceivablePayload = {
    received_at: string;
};

type PartialSettleAccountReceivablePayload = {
    amount: number;
    received_at: string;
};

function normalizeAccountReceivable(
    accountReceivable: AccountReceivable,
): AccountReceivable {
    return {
        ...accountReceivable,
        total_amount: toNumber(accountReceivable.total_amount),
        amount: toNumber(accountReceivable.amount),
        amount_paid: toNumber(accountReceivable.amount_paid),
        remaining_balance: toNumber(accountReceivable.remaining_balance),
    };
}

class AccountReceivableService extends ApiService<AccountReceivable> {
    constructor() {
        super({ basePath: '/account-receivables' });
    }

    async list(params?: ListParams): Promise<PaginatedData<AccountReceivable>> {
        const response = await super.list(params);

        return {
            ...response,
            data: response.data.map(normalizeAccountReceivable),
        };
    }

    async get(id: number): Promise<AccountReceivable> {
        const accountReceivable = await super.get(id);

        return normalizeAccountReceivable(accountReceivable);
    }

    async createManual(
        payload: CreateManualAccountReceivableInput,
    ): Promise<void> {
        await super.create(payload as unknown as Partial<AccountReceivable>);
    }

    async update(
        id: number,
        payload: CreateManualAccountReceivableInput,
    ): Promise<AccountReceivable> {
        const response = await apiClient.put<AccountReceivable>(
            `/account-receivables/${id}`,
            payload,
        );

        return normalizeAccountReceivable(response.data);
    }

    async settle(
        id: number,
        payload: SettleAccountReceivablePayload,
    ): Promise<AccountReceivable> {
        const response = await apiClient.post<AccountReceivable>(
            `/account-receivables/${id}/settle`,
            payload,
        );

        return normalizeAccountReceivable(response.data);
    }

    async unsettle(id: number): Promise<AccountReceivable> {
        const response = await apiClient.post<AccountReceivable>(
            `/account-receivables/${id}/unsettle`,
            {},
        );

        return normalizeAccountReceivable(response.data);
    }

    async partialSettle(
        id: number,
        payload: PartialSettleAccountReceivablePayload,
    ): Promise<AccountReceivable> {
        const response = await apiClient.post<AccountReceivable>(
            `/account-receivables/${id}/partial-settle`,
            payload,
        );

        return normalizeAccountReceivable(response.data);
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/account-receivables/${id}`);
    }
}

export const accountReceivableService = new AccountReceivableService();
