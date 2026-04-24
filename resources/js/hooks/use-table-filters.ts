import { useState, useMemo, useCallback } from 'react';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | string[] | null;
}

export interface UseTableFiltersOptions {
  initialFilters?: Filter[];
  onFiltersChange?: (filters: Filter[]) => void;
}

export interface UseTableFiltersReturn {
  filters: Filter[];
  addFilter: (filter: Omit<Filter, 'id'>) => void;
  removeFilter: (id: string) => void;
  updateFilter: (id: string, updates: Partial<Omit<Filter, 'id'>>) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}

export function useTableFilters(
  options: UseTableFiltersOptions = {}
): UseTableFiltersReturn {
  const [filters, setFilters] = useState<Filter[]>(options.initialFilters ?? []);
  const { onFiltersChange } = options;

  const addFilter = useCallback((filter: Omit<Filter, 'id'>) => {
    const newFilter: Filter = {
      ...filter,
      id: `filter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setFilters(prev => {
      const updated = [...prev, newFilter];
      onFiltersChange?.(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFiltersChange?.(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const updateFilter = useCallback((id: string, updates: Partial<Omit<Filter, 'id'>>) => {
    setFilters(prev => {
      const updated = prev.map(f => 
        f.id === id ? { ...f, ...updates } : f
      );
      onFiltersChange?.(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const clearFilters = useCallback(() => {
    setFilters([]);
    onFiltersChange?.([]);
  }, [onFiltersChange]);

  const hasFilters = useMemo(() => filters.length > 0, [filters]);

  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilters,
  };
}

export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: Filter[]
): T[] {
  if (filters.length === 0) return data;

  return data.filter(item => {
    return filters.every(filter => {
      const value = item[filter.field];
      const filterValue = filter.value;

      if (filterValue === null || filterValue === '') return true;

      switch (filter.operator) {
        case 'eq':
          return value === filterValue;
        case 'neq':
          return value !== filterValue;
        case 'gt':
          return typeof value === 'number' && typeof filterValue === 'number' && value > filterValue;
        case 'gte':
          return typeof value === 'number' && typeof filterValue === 'number' && value >= filterValue;
        case 'lt':
          return typeof value === 'number' && typeof filterValue === 'number' && value < filterValue;
        case 'lte':
          return typeof value === 'number' && typeof filterValue === 'number' && value <= filterValue;
        case 'contains':
          return typeof value === 'string' && 
                 typeof filterValue === 'string' && 
                 value.toLowerCase().includes(filterValue.toLowerCase());
        case 'in':
          return Array.isArray(filterValue) && filterValue.includes(value as string);
        default:
          return true;
      }
    });
  });
}