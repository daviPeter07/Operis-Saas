import { router } from '@inertiajs/react';
import * as React from 'react';

export type TableQueryState = {
    search: string;
    currentPage: number;
    perPage: number;
    filters: Record<string, string>;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setPerPage: React.Dispatch<React.SetStateAction<number>>;
    setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
    updateUrl: (opts: {
        page?: number;
        perPage?: number;
        search?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
        filters?: Record<string, string>;
    }) => void;
};

function parseQueryParams(search: string) {
    const params = new URLSearchParams(search);

    return {
        page: parseInt(params.get('page') || '1'),
        perPage: parseInt(params.get('per_page') || '25'),
        search: params.get('search') || '',
        sortBy: params.get('sort_by') || '',
        sortDirection: (params.get('sort_direction') || 'asc') as
            | 'asc'
            | 'desc',
        filters: Object.fromEntries(
            Array.from(params.entries()).filter(
                ([key]) =>
                    ![
                        'page',
                        'per_page',
                        'search',
                        'sort_by',
                        'sort_direction',
                    ].includes(key),
            ),
        ),
    };
}

function buildQueryString(params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, string>;
}) {
    const paramsObj = new URLSearchParams();

    if (params.page && params.page > 1) {
        paramsObj.set('page', String(params.page));
    }

    if (params.perPage && params.perPage !== 25) {
        paramsObj.set('per_page', String(params.perPage));
    }

    if (params.search) {
        paramsObj.set('search', params.search);
    }

    if (params.sortBy) {
        paramsObj.set('sort_by', params.sortBy);
    }

    if (params.sortBy && params.sortDirection !== 'asc') {
        paramsObj.set('sort_direction', params.sortDirection || 'asc');
    }

    Object.entries(params.filters || {}).forEach(([key, value]) => {
        if (value) {
            paramsObj.set(key, value);
        }
    });

    return paramsObj.toString();
}

export function useTableQueryState(routeUrl?: string): TableQueryState {
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(25);
    const [filters, setFilters] = React.useState<Record<string, string>>({});
    const [sortBy, setSortBy] = React.useState('');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'asc',
    );

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = parseQueryParams(window.location.search);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearch(params.search);

        setCurrentPage(params.page);

        setPerPage(params.perPage);

        setFilters(params.filters);

        setSortBy(params.sortBy);

        setSortDirection(params.sortDirection === 'desc' ? 'desc' : 'asc');
    }, []);

    const updateUrl = React.useCallback(
        (opts: {
            page?: number;
            perPage?: number;
            search?: string;
            sortBy?: string;
            sortDirection?: 'asc' | 'desc';
            filters?: Record<string, string>;
        }) => {
            const newPage = opts.page ?? currentPage;
            const newPerPage = opts.perPage ?? perPage;
            const newSearch = opts.search ?? search;
            const newSortBy = opts.sortBy ?? sortBy;
            const newSortDirection = opts.sortDirection ?? sortDirection;
            const newFilters = opts.filters ?? filters;

            const queryString = buildQueryString({
                page: newPage,
                perPage: newPerPage,
                search: newSearch,
                sortBy: newSortBy,
                sortDirection: newSortDirection,
                filters: newFilters,
            });

            const currentPath =
                typeof window !== 'undefined' ? window.location.pathname : '';
            const baseUrl = routeUrl || currentPath || '/dashboard';
            const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;

            router.get(url, {}, { replace: true, preserveState: true });
        },
        [
            currentPage,
            filters,
            perPage,
            routeUrl,
            search,
            sortBy,
            sortDirection,
        ],
    );

    return {
        search,
        currentPage,
        perPage,
        filters,
        sortBy,
        sortDirection,
        setSearch,
        setCurrentPage,
        setPerPage,
        setFilters,
        setSortBy,
        setSortDirection,
        updateUrl,
    };
}
