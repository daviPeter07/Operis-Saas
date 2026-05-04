import {
    ApiService
    
    
} from '@/lib/apiService';
import type {ListParams, PaginatedData} from '@/lib/apiService';
import type { AccountReceivable } from '@/schemas/accountReceivable';

class AccountReceivableService extends ApiService<AccountReceivable> {
    constructor() {
        super({ basePath: '/account-receivables' });
    }

    async list(params?: ListParams): Promise<PaginatedData<AccountReceivable>> {
        return super.list(params);
    }

    async get(id: number): Promise<AccountReceivable> {
        return super.get(id);
    }
}

export const accountReceivableService = new AccountReceivableService();
