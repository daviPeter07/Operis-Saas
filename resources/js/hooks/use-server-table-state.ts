import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import type {
    CustomRange,
    Period,
} from '@/features/dashboard/overview/period-filter';
import { resolveDateRange } from '@/features/dashboard/overview/period-range';
import { nowInAppTimeZone } from '@/lib/app-timezone';

const periods = [
    'current-month',
    'previous-month',
    '7d',
    '30d',
    '90d',
    '12m',
    'next-month',
    'all',
    'custom',
] as const satisfies readonly Period[];

export type SortDirection = 'asc' | 'desc';

export type ServerTableState = {
    page: number;
    perPage: number;
    sort: string | null;
    direction: SortDirection;
    filters: Record<string, string>;
    period: Period;
    customRange: CustomRange;
    setPage: (page: number) => void;
    setSort: (sort: string, direction: SortDirection) => void;
    clearSort: () => void;
    setFilter: (key: string, value: string) => void;
    clearFilters: () => void;
    setPeriod: (period: Period, customRange?: CustomRange) => void;
    hasActiveFilters: boolean;
    apiParams: Record<string, string>;
};

type Options = {
    filterKeys: readonly string[];
    defaultFilters?: Readonly<Record<string, string>>;
    perPage?: number;
};

const noDefaults: Readonly<Record<string, string>> = {};

export function useServerTableState({
    filterKeys,
    defaultFilters = noDefaults,
    perPage = 25,
}: Options): ServerTableState {
    const parsers = useMemo(
        () => ({
            page: parseAsInteger.withDefault(1),
            sort: parseAsString,
            direction: parseAsStringLiteral(['asc', 'desc'] as const),
            period: parseAsStringLiteral(periods).withDefault('all'),
            date_from: parseAsString,
            date_to: parseAsString,
            ...Object.fromEntries(
                filterKeys.map((key) => [
                    key,
                    defaultFilters[key]
                        ? parseAsString.withDefault(defaultFilters[key])
                        : parseAsString,
                ]),
            ),
        }),
        [defaultFilters, filterKeys],
    );

    const [query, setQuery] = useQueryStates(parsers, { history: 'replace' });
    const values = query as Record<string, string | number | null>;

    const filters = useMemo(() => {
        const entries = filterKeys
            .map((key) => [key, String(values[key] ?? '')] as const)
            .filter(([, value]) => value !== '' && value !== 'all');

        return Object.fromEntries(entries);
    }, [filterKeys, values]);

    const period = query.period as Period;
    const customRange: CustomRange = {
        from: query.date_from ?? '',
        to: query.date_to ?? '',
    };

    const setPage = useCallback(
        (page: number) => void setQuery({ page }),
        [setQuery],
    );

    const setSort = useCallback(
        (sort: string, direction: SortDirection) =>
            void setQuery({ sort, direction, page: 1 }),
        [setQuery],
    );

    const clearSort = useCallback(
        () => void setQuery({ sort: null, direction: null, page: 1 }),
        [setQuery],
    );

    // A filter with a default stores "all" when cleared, or the default comes back.
    const setFilter = useCallback(
        (key: string, value: string) => {
            const cleared = defaultFilters[key] ? 'all' : null;

            void setQuery({ [key]: value === '' ? cleared : value, page: 1 });
        },
        [defaultFilters, setQuery],
    );

    const clearFilters = useCallback(
        () =>
            void setQuery({
                ...Object.fromEntries(filterKeys.map((key) => [key, null])),
                page: 1,
            }),
        [filterKeys, setQuery],
    );

    const setPeriod = useCallback(
        (nextPeriod: Period, nextRange?: CustomRange) =>
            void setQuery({
                period: nextPeriod,
                date_from:
                    nextPeriod === 'custom' ? (nextRange?.from ?? null) : null,
                date_to:
                    nextPeriod === 'custom' ? (nextRange?.to ?? null) : null,
                page: 1,
            }),
        [setQuery],
    );

    const apiParams = useMemo(() => {
        const params: Record<string, string> = {
            page: String(query.page),
            per_page: String(perPage),
        };

        if (query.sort) {
            params.sort = query.sort;
            params.direction = query.direction ?? 'asc';
        }

        for (const [key, value] of Object.entries(filters)) {
            params[`filter[${key}]`] = value;
        }

        const range = resolveDateRange(
            query.period as Period,
            { from: query.date_from ?? '', to: query.date_to ?? '' },
            nowInAppTimeZone(),
        );

        if (range) {
            params.date_from = range.from;
            params.date_to = range.to;
        }

        return params;
    }, [
        filters,
        perPage,
        query.date_from,
        query.date_to,
        query.direction,
        query.page,
        query.period,
        query.sort,
    ]);

    const hasActiveFilters = filterKeys.some(
        (key) =>
            String(values[key] ?? '') !== String(defaultFilters[key] ?? ''),
    );

    return {
        page: query.page,
        perPage,
        sort: query.sort,
        direction: query.direction ?? 'asc',
        filters,
        period,
        customRange,
        setPage,
        setSort,
        clearSort,
        setFilter,
        clearFilters,
        setPeriod,
        hasActiveFilters,
        apiParams,
    };
}
