interface ApiResponse<T> {
    data: T;
    [key: string]: unknown;
}

class ApiClient {
    private baseUrl = (
        (import.meta.env.VITE_API_BASE_PATH as string | undefined) ??
        `${((import.meta.env.VITE_APP_BASE_PATH as string | undefined) ?? '/operis').replace(/\/$/, '')}/api`
    ).replace(/\/$/, '');

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url: string,
        options: { params?: Record<string, unknown>; data?: unknown } = {},
    ): Promise<T> {
        const { params, data } = options;

        const queryString = params
            ? '?' +
              new URLSearchParams(params as Record<string, string>).toString()
            : '';

        try {
            const response = await fetch(
                `${this.baseUrl}${url}${queryString}`,
                {
                    method,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: data ? JSON.stringify(data) : undefined,
                    credentials: 'include',
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw {
                    message: errorData.message || `Erro ${response.status}`,
                    errors: errorData.errors,
                };
            }

            if (response.status === 204) {
                return {} as T;
            }

            const responseData = await response.json();

            return responseData as T;
        } catch (error) {
            if (error && typeof error === 'object' && 'message' in error) {
                throw error;
            }

            throw { message: 'Erro desconhecido na requisição' };
        }
    }

    async get<T>(
        url: string,
        params?: Record<string, unknown>,
    ): Promise<ApiResponse<T>> {
        const response = await this.request<unknown>('GET', url, { params });

        if (response && typeof response === 'object' && 'data' in response) {
            return response as ApiResponse<T>;
        }

        return { data: response as T };
    }

    async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        const response = await this.request<unknown>('POST', url, { data });

        if (response && typeof response === 'object' && 'data' in response) {
            return response as ApiResponse<T>;
        }

        return { data: response as T };
    }

    async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        const response = await this.request<unknown>('PUT', url, { data });

        if (response && typeof response === 'object' && 'data' in response) {
            return response as ApiResponse<T>;
        }

        return { data: response as T };
    }

    async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        const response = await this.request<unknown>('PATCH', url, { data });

        if (response && typeof response === 'object' && 'data' in response) {
            return response as ApiResponse<T>;
        }

        return { data: response as T };
    }

    async delete<T>(url: string): Promise<ApiResponse<T>> {
        const response = await this.request<unknown>('DELETE', url);

        if (response && typeof response === 'object' && 'data' in response) {
            return response as ApiResponse<T>;
        }

        return { data: response as T };
    }
}

export const apiClient = new ApiClient();
