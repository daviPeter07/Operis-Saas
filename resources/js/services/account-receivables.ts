import { ApiService } from '@/lib/apiService';
import type { ListParams, PaginatedData } from '@/lib/apiService';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import { toNumber } from './normalizers';

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
}

export const accountReceivableService = new AccountReceivableService();
