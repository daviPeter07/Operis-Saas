import { router } from '@inertiajs/react';
import * as React from 'react';
import type {
    CustomRange,
    Period,
} from '@/features/dashboard/overview/period-filter';

export type TableQueryState = {
    search: string;
    currentPage: number;
    perPage: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    period: Period;
    customRange: CustomRange;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setPerPage: React.Dispatch<React.SetStateAction<number>>;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
    setPeriod: React.Dispatch<React.SetStateAction<Period>>;
    setCustomRange: React.Dispatch<React.SetStateAction<CustomRange>>;
    updateUrl: (opts: {
        page?: number;
        perPage?: number;
        search?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
        period?: Period;
        dateFrom?: string;
        dateTo?: string;
    }) => void;
};

function parseQueryParams(search: string) {
    const params = new URLSearchParams(search);
    const periodParam = params.get('period');
    const period: Period =
        periodParam === 'current-month' ||
        periodParam === '7d' ||
        periodParam === '30d' ||
        periodParam === '90d' ||
        periodParam === '12m' ||
        periodParam === 'next-month' ||
        periodParam === 'custom'
            ? periodParam
            : 'all';

    return {
        page: parseInt(params.get('page') || '1'),
        perPage: parseInt(params.get('per_page') || '25'),
        search: params.get('search') || '',
        sortBy: params.get('sort_by') || '',
        sortDirection: (params.get('sort_direction') || 'asc') as
            | 'asc'
            | 'desc',
        period,
        customRange: {
            from: params.get('date_from') || '',
            to: params.get('date_to') || '',
        },
    };
}

function buildQueryString(params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    period?: Period;
    dateFrom?: string;
    dateTo?: string;
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

    if (params.period && params.period !== 'all') {
        paramsObj.set('period', params.period);
    }

    if (params.period === 'custom' && params.dateFrom && params.dateTo) {
        paramsObj.set('date_from', params.dateFrom);
        paramsObj.set('date_to', params.dateTo);
    }

    return paramsObj.toString();
}

export function useTableQueryState(routeUrl?: string): TableQueryState {
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(25);
    const [sortBy, setSortBy] = React.useState('');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'asc',
    );
    const [period, setPeriod] = React.useState<Period>('all');
    const [customRange, setCustomRange] = React.useState<CustomRange>({
        from: '',
        to: '',
    });

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = parseQueryParams(window.location.search);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearch(params.search);

        setCurrentPage(params.page);

        setPerPage(params.perPage);

        setSortBy(params.sortBy);

        setSortDirection(params.sortDirection === 'desc' ? 'desc' : 'asc');

        setPeriod(params.period);

        setCustomRange(params.customRange);
    }, []);

    const updateUrl = React.useCallback(
        (opts: {
            page?: number;
            perPage?: number;
            search?: string;
            sortBy?: string;
            sortDirection?: 'asc' | 'desc';
            period?: Period;
            dateFrom?: string;
            dateTo?: string;
        }) => {
            const newPage = opts.page ?? currentPage;
            const newPerPage = opts.perPage ?? perPage;
            const newSearch = opts.search ?? search;
            const newSortBy = opts.sortBy ?? sortBy;
            const newSortDirection = opts.sortDirection ?? sortDirection;
            const newPeriod = opts.period ?? period;
            const newDateFrom = opts.dateFrom ?? customRange.from;
            const newDateTo = opts.dateTo ?? customRange.to;

            const queryString = buildQueryString({
                page: newPage,
                perPage: newPerPage,
                search: newSearch,
                sortBy: newSortBy,
                sortDirection: newSortDirection,
                period: newPeriod,
                dateFrom: newDateFrom,
                dateTo: newDateTo,
            });

            const currentPath =
                typeof window !== 'undefined' ? window.location.pathname : '';
            const baseUrl = routeUrl || currentPath || '/dashboard';
            const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;

            router.get(url, {}, { replace: true, preserveState: true });
        },
        [
            currentPage,
            customRange.from,
            customRange.to,
            perPage,
            period,
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
        sortBy,
        sortDirection,
        period,
        customRange,
        setSearch,
        setCurrentPage,
        setPerPage,
        setSortBy,
        setSortDirection,
        setPeriod,
        setCustomRange,
        updateUrl,
    };
}
