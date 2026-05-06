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
}

export const accountReceivableService = new AccountReceivableService();
