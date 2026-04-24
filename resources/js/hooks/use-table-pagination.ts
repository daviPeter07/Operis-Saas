import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
    page: number;
    perPage: number;
    total: number;
}

export interface UseTablePaginationOptions {
    initialPage?: number;
    perPage?: number;
    total?: number;
}

export interface UseTablePaginationReturn {
    pagination: PaginationState;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    setPerPage: (perPage: number) => void;
    setTotal: (total: number) => void;
    resetPagination: () => void;
}

export function useTablePagination(
    options: UseTablePaginationOptions = {},
): UseTablePaginationReturn {
    const { initialPage = 1, perPage = 25 } = options;

    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(perPage);
    const [total, setTotal] = useState(options.total ?? 0);

    const totalPages = useMemo(() => {
        if (total === 0) return 0;
        return Math.ceil(total / pageSize);
    }, [total, pageSize]);

    const startIndex = useMemo(() => {
        return (page - 1) * pageSize;
    }, [page, pageSize]);

    const endIndex = useMemo(() => {
        return Math.min(startIndex + pageSize, total);
    }, [startIndex, pageSize, total]);

    const hasNextPage = useMemo(() => {
        return page < totalPages;
    }, [page, totalPages]);

    const hasPreviousPage = useMemo(() => {
        return page > 1;
    }, [page]);

    const goToPage = useCallback(
        (newPage: number) => {
            const clampedPage = Math.max(1, Math.min(newPage, totalPages || 1));
            setPage(clampedPage);
        },
        [totalPages],
    );

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setPage((prev) => prev + 1);
        }
    }, [hasNextPage]);

    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            setPage((prev) => prev - 1);
        }
    }, [hasPreviousPage]);

    const resetPagination = useCallback(() => {
        setPage(1);
    }, []);

    return {
        pagination: {
            page,
            perPage: pageSize,
            total,
        },
        totalPages,
        startIndex,
        endIndex,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        setPerPage: setPageSize,
        setTotal,
        resetPagination,
    };
}
