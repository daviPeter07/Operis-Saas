import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

export interface UseTableSearchOptions {
    debounceMs?: number;
    searchableFields?: string[];
    onSearchChange?: (search: string) => void;
}

export interface UseTableSearchReturn {
    search: string;
    setSearch: (value: string) => void;
    debouncedSearch: string;
    clearSearch: () => void;
    hasSearch: boolean;
}

export function useTableSearch(
    options: UseTableSearchOptions = {},
): UseTableSearchReturn {
    const { debounceMs = 300, onSearchChange } = options;

    const [search, setSearchState] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const setSearch = useCallback(
        (value: string) => {
            setSearchState(value);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setDebouncedSearch(value);
                onSearchChange?.(value);
            }, debounceMs);
        },
        [debounceMs, onSearchChange],
    );

    const clearSearch = useCallback(() => {
        setSearchState('');
        setDebouncedSearch('');
        onSearchChange?.('');
    }, [onSearchChange]);

    const hasSearch = useMemo(() => search.length > 0, [search]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        search,
        setSearch,
        debouncedSearch,
        clearSearch,
        hasSearch,
    };
}

export function searchData<T extends Record<string, unknown>>(
    data: T[],
    searchTerm: string,
    fields?: string[],
): T[] {
    if (!searchTerm || searchTerm.trim() === '') return data;

    const normalizedSearch = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
        if (fields && fields.length > 0) {
            return fields.some((field) => {
                const value = item[field];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(normalizedSearch);
            });
        }

        return Object.values(item).some((value) => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(normalizedSearch);
        });
    });
}
