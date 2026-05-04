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
        const response = await apiClient.get<PaginatedData<T>>(
            this.basePath,
            params,
        );

        return response.data;
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

        return response.data;
    }
}
