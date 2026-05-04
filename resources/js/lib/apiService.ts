import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/lib/schemas/base';

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

export abstract class ApiService<T extends { id: number }> {
    protected basePath: string;

    constructor(options: BaseServiceOptions) {
        this.basePath = options.basePath;
    }

    async list(params?: ListParams): Promise<PaginatedResponse<T>> {
        return apiClient.get<PaginatedResponse<T>>(this.basePath, params);
    }

    async get(id: number): Promise<ApiResponse<T>> {
        return apiClient.get<ApiResponse<T>>(`${this.basePath}/${id}`);
    }

    async create(data: Partial<T>): Promise<ApiResponse<T>> {
        return apiClient.post<ApiResponse<T>>(this.basePath, data);
    }

    async update(id: number, data: Partial<T>): Promise<ApiResponse<T>> {
        return apiClient.put<ApiResponse<T>>(`${this.basePath}/${id}`, data);
    }

    async delete(id: number): Promise<ApiResponse<{ success: boolean }>> {
        return apiClient.delete<ApiResponse<{ success: boolean }>>(`${this.basePath}/${id}`);
    }
}