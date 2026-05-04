import { ApiService } from '@/lib/apiService';
import type { ListParams } from '@/lib/apiService';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';
import type { AccountReceivable } from '@/schemas/accountReceivable';

class AccountReceivableService extends ApiService<AccountReceivable> {
    constructor() {
        super({ basePath: '/account-receivables' });
    }

    async list(
        params?: ListParams,
    ): Promise<PaginatedResponse<AccountReceivable>> {
        return super.list(params);
    }

    async get(id: number): Promise<ApiResponse<AccountReceivable>> {
        return super.get(id);
    }
}

export const accountReceivableService = new AccountReceivableService();
