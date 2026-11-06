import { apiClient } from '@/lib/apiClient';

export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    fetch_all?: boolean;
    [key: string]: unknown;
}

// TableIndexRequest::MAX_PER_PAGE.
const FETCH_ALL_PER_PAGE = 100;

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

    // Without `page` it loads every page (fetch_all: false keeps only the first one).
    // The API's largest page size keeps the number of requests low, and the pages
    // after the first are requested together.
    async list(params?: ListParams): Promise<PaginatedData<T>> {
        const { fetch_all: fetchAllParam, ...query } = params ?? {};
        const shouldFetchAll = fetchAllParam !== false && !query.page;
        const firstPage = await this.fetchPage(
            shouldFetchAll
                ? { ...query, per_page: query.per_page ?? FETCH_ALL_PER_PAGE }
                : query,
        );

        if (!shouldFetchAll || firstPage.meta.last_page <= 1) {
            return firstPage;
        }

        const otherPages = await Promise.all(
            Array.from({ length: firstPage.meta.last_page - 1 }, (_, index) =>
                this.fetchPage({
                    ...query,
                    page: index + 2,
                    per_page: firstPage.meta.per_page,
                }),
            ),
        );
        const allRows = firstPage.data.concat(
            ...otherPages.map((page) => page.data),
        );

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

    private async fetchPage(
        query: Omit<ListParams, 'fetch_all'>,
    ): Promise<PaginatedData<T>> {
        const response = await apiClient.get<unknown>(this.basePath, query);
        const payload =
            response &&
            typeof response === 'object' &&
            'meta' in response &&
            'data' in response
                ? (response as unknown)
                : (response.data as unknown);

        return this.normalizeListPayload(payload);
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
                current_page?: number;
                last_page?: number;
                per_page?: number;
                total?: number;
            };

            if (Array.isArray(maybePaginated.data)) {
                const total =
                    maybePaginated.meta?.total ??
                    maybePaginated.total ??
                    maybePaginated.data.length;
                const perPage =
                    maybePaginated.meta?.per_page ??
                    maybePaginated.per_page ??
                    maybePaginated.data.length;
                const lastPage =
                    maybePaginated.meta?.last_page ??
                    maybePaginated.last_page ??
                    1;
                const currentPage =
                    maybePaginated.meta?.current_page ??
                    maybePaginated.current_page ??
                    1;

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
