import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { categoriesQueryKey } from '@/hooks/use-categories';
import type { Category } from '@/schemas/category';
import { categoryService } from '@/services/categories';
import type { ApiParams, CategoryForm, CategoryRow } from './types';

export function useCategoriesPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...categoriesQueryKey, 'page', apiParams],
        queryFn: () => categoryService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllCategories(
    apiParams: ApiParams,
): Promise<Category[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await categoryService.list({ ...filters, per_page: 100 });

    return response.data;
}

export function toCategoryRow(category: Category): CategoryRow {
    return {
        id: String(category.id),
        category,
        name: category.name,
        status: category.status,
    };
}

export function toCategoryFormValues(category?: Category | null): CategoryForm {
    return {
        name: category?.name ?? '',
        status: category?.status ?? 'active',
    };
}
