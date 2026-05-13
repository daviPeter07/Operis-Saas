import { apiClient } from '@/lib/apiClient';

export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    [key: string]: unknown;
}

export interface BaseServiceOptions {
    basePath: string;
}

export interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export abstract class ApiService<T extends { id: number }> {
    protected basePath: string;

    constructor(options: BaseServiceOptions) {
        this.basePath = options.basePath;
    }

    async list(params?: ListParams): Promise<PaginatedData<T>> {
        const response = await apiClient.get<unknown>(this.basePath, params);
        const firstPage = this.normalizeListPayload(response.data as unknown);

        if (params?.page || firstPage.meta.last_page <= 1) {
            return firstPage;
        }

        let allRows = [...firstPage.data];

        for (let page = 2; page <= firstPage.meta.last_page; page++) {
            const nextResponse = await apiClient.get<unknown>(this.basePath, {
                ...params,
                page,
                per_page: params?.per_page ?? firstPage.meta.per_page,
            });
            const nextPage = this.normalizeListPayload(nextResponse.data as unknown);
            allRows = allRows.concat(nextPage.data);
        }

        return {
            data: allRows,
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: allRows.length,
                total: firstPage.meta.total,
            },
        };
    }

    private normalizeListPayload(payload: unknown): PaginatedData<T> {
        if (Array.isArray(payload)) {
            return {
                data: payload as T[],
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: payload.length,
                    total: payload.length,
                },
            };
        }

        if (payload && typeof payload === 'object') {
            const maybePaginated = payload as {
                data?: unknown;
                meta?: {
                    current_page?: number;
                    last_page?: number;
                    per_page?: number;
                    total?: number;
                };
            };

            if (Array.isArray(maybePaginated.data)) {
                const total = maybePaginated.meta?.total ?? maybePaginated.data.length;
                const perPage =
                    maybePaginated.meta?.per_page ?? maybePaginated.data.length;
                const lastPage = maybePaginated.meta?.last_page ?? 1;
                const currentPage = maybePaginated.meta?.current_page ?? 1;

                return {
                    data: maybePaginated.data as T[],
                    meta: {
                        current_page: currentPage,
                        last_page: lastPage,
                        per_page: perPage,
                        total,
                    },
                };
            }
        }

        return {
            data: [],
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: 0,
                total: 0,
            },
        };
    }

    async get(id: number): Promise<T> {
        const response = await apiClient.get<T>(`${this.basePath}/${id}`);

        return response.data;
    }

    async create(data: Partial<T>): Promise<T> {
        const response = await apiClient.post<T>(this.basePath, data);

        return response.data;
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const response = await apiClient.put<T>(`${this.basePath}/${id}`, data);

        return response.data;
    }

    async delete(id: number): Promise<{ success: boolean }> {
        const response = await apiClient.delete<{ success: boolean }>(
            `${this.basePath}/${id}`,
        );

        return response.data ?? { success: true };
    }
}
