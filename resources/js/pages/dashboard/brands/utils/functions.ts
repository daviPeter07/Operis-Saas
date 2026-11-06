import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { brandsQueryKey } from '@/hooks/use-brands';
import type { Brand } from '@/schemas/brand';
import { brandService } from '@/services/brands';
import type { ApiParams, BrandForm, BrandRow } from './types';

export function useBrandsPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...brandsQueryKey, 'page', apiParams],
        queryFn: () => brandService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export async function fetchAllBrands(apiParams: ApiParams): Promise<Brand[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await brandService.list({ ...filters, per_page: 100 });

    return response.data;
}

export function toBrandRow(brand: Brand): BrandRow {
    return {
        id: String(brand.id),
        brand,
        name: brand.name,
        status: brand.status,
    };
}

export function toBrandFormValues(brand?: Brand | null): BrandForm {
    return {
        name: brand?.name ?? '',
        status: brand?.status ?? 'active',
    };
}
