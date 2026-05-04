import router from '@inertiajs/core';

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

class ApiClient {
    private baseUrl = '/api';

    async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
        return this.request<T>('get', url, { params });
    }

    async post<T>(url: string, data?: unknown): Promise<T> {
        return this.request<T>('post', url, { data });
    }

    async put<T>(url: string, data?: unknown): Promise<T> {
        return this.request<T>('put', url, { data });
    }

    async patch<T>(url: string, data?: unknown): Promise<T> {
        return this.request<T>('patch', url, { data });
    }

    async delete<T>(url: string): Promise<T> {
        return this.request<T>('delete', url);
    }

    private async request<T>(
        method: 'get' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        options: { params?: Record<string, unknown>; data?: unknown } = {},
    ): Promise<T> {
        const { params, data } = options;

        try {
            const response = await router.visit(`${this.baseUrl}${url}`, {
                method,
                data,
                params,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                preserveScroll: true,
            });

            if (response.props.errors) {
                throw this.handleValidationErrors(response.props.errors);
            }

            return response.props as unknown as T;
        } catch (error) {
            if (error instanceof Error) {
                throw this.normalizeError(error);
            }

            throw new Error('Erro desconhecido na requisição');
        }
    }

    private handleValidationErrors(errors: unknown): ApiError {
        const errorObj = errors as Record<string, string[]>;
        const firstKey = Object.keys(errorObj)[0];

        return {
            message: firstKey ? errorObj[firstKey][0] : 'Erro de validação',
            errors: errorObj,
        };
    }

    private normalizeError(error: Error): ApiError {
        return {
            message: error.message || 'Erro na requisição',
        };
    }
}

export const apiClient = new ApiClient();
