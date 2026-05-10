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

function normalizeAccountReceivable(
    accountReceivable: AccountReceivable,
): AccountReceivable {
    return {
        ...accountReceivable,
        amount: toNumber(accountReceivable.amount),
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

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/account-receivables/${id}`);
    }
}

export const accountReceivableService = new AccountReceivableService();
