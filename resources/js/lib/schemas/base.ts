export interface ApiResponse<T> {
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export function handleApiError(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return (error as { message: string }).message;
    }

    return 'Erro desconhecido';
}

export function isApiResponse<T>(
    response: unknown,
): response is ApiResponse<T> {
    return (
        typeof response === 'object' && response !== null && 'data' in response
    );
}
