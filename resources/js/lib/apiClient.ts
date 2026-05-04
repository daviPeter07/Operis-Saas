interface ApiResponse<T> {
    data: T;
    [key: string]: unknown;
}

class ApiClient {
    private baseUrl = '/api';

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
        return this.request<ApiResponse<T>>('GET', url, { params });
    }

    async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<ApiResponse<T>>('POST', url, { data });
    }

    async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<ApiResponse<T>>('PUT', url, { data });
    }

    async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<ApiResponse<T>>('PATCH', url, { data });
    }

    async delete<T>(url: string): Promise<ApiResponse<T>> {
        return this.request<ApiResponse<T>>('DELETE', url);
    }
}

export const apiClient = new ApiClient();
