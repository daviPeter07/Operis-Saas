import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import type { Filter } from './use-table-filters';

export interface UseTableUrlStateOptions {
    routeUrl?: string;
    initialPerPage?: number;
}

export interface UseTableUrlStateReturn {
    search: string;
    setSearch: (value: string) => void;
    clearSearch: () => void;
    filters: Filter[];
    addFilter: (filter: Omit<Filter, 'id'>) => void;
    removeFilter: (id: string) => void;
    clearFilters: () => void;
    hasFilters: boolean;
    page: number;
    perPage: number;
    total: number;
    setTotal: (total: number) => void;
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    reload: () => void;
}

export function useTableUrlState(
    options: UseTableUrlStateOptions = {},
): UseTableUrlStateReturn {
    const { routeUrl = '', initialPerPage = 25 } = options;

    const [state, setState] = useState({
        search: '',
        filters: [] as Filter[],
        page: 1,
        perPage: initialPerPage,
        total: 0,
    });

    const totalPages = Math.ceil(state.total / state.perPage);
    const hasNextPage = state.page < totalPages;
    const hasPreviousPage = state.page > 1;

    const updateUrl = useCallback(
        (updates: Record<string, unknown>, pageReset = false) => {
            const params = new URLSearchParams();

            if (state.search && updates.search !== '') {
                params.set(
                    'search',
                    (updates.search as string) || state.search,
                );
            }

            if (pageReset) {
                params.set('page', '1');
            } else {
                params.set('page', String(updates.page ?? state.page));
            }

            if (state.perPage !== initialPerPage) {
                params.set('per_page', String(state.perPage));
            }

            Object.entries(state.filters).forEach(([field, value]) => {
                params.set(`filters[${field}]`, String(value));
            });

            const url =
                routeUrl + (params.toString() ? `?${params.toString()}` : '');
            router.get(url, {}, { replace: true, preserveState: true });
        },
        [routeUrl, state, initialPerPage],
    );

    const setSearch = useCallback(
        (value: string) => {
            setState((prev) => ({ ...prev, search: value }));
            updateUrl({ search: value }, true);
        },
        [updateUrl],
    );

    const clearSearch = useCallback(() => {
        setState((prev) => ({ ...prev, search: '' }));
        updateUrl({ search: '' }, true);
    }, [updateUrl]);

    const addFilter = useCallback(
        (filter: Omit<Filter, 'id'>) => {
            const newFilter: Filter = { ...filter, id: `filter-${Date.now()}` };
            setState((prev) => ({
                ...prev,
                filters: [...prev.filters, newFilter],
            }));
            updateUrl({}, true);
        },
        [updateUrl],
    );

    const removeFilter = useCallback(
        (id: string) => {
            setState((prev) => ({
                ...prev,
                filters: prev.filters.filter((f) => f.id !== id),
            }));
            updateUrl({}, true);
        },
        [updateUrl],
    );

    const clearFilters = useCallback(() => {
        setState((prev) => ({ ...prev, filters: [] }));
        updateUrl({}, true);
    }, [updateUrl]);

    const goToPage = useCallback(
        (newPage: number) => {
            setState((prev) => ({ ...prev, page: newPage }));
            updateUrl({ page: newPage });
        },
        [updateUrl],
    );

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            goToPage(state.page + 1);
        }
    }, [state.page, hasNextPage, goToPage]);

    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            goToPage(state.page - 1);
        }
    }, [state.page, hasPreviousPage, goToPage]);

    const setTotal = useCallback((newTotal: number) => {
        setState((prev) => ({ ...prev, total: newTotal }));
    }, []);

    const reload = useCallback(() => {
        router.reload();
    }, []);

    return {
        search: state.search,
        setSearch,
        clearSearch,
        filters: state.filters,
        addFilter,
        removeFilter,
        clearFilters,
        hasFilters: state.filters.length > 0,
        page: state.page,
        perPage: state.perPage,
        total: state.total,
        setTotal,
        goToPage,
        nextPage,
        previousPage,
        hasNextPage,
        hasPreviousPage,
        reload,
    };
}
