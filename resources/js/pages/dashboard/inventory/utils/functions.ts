import { router } from '@inertiajs/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { productsQueryKey } from '@/hooks/use-products';
import { formatCurrencyBR } from '@/lib/format';
import type { Product } from '@/schemas/product';
import { productService } from '@/services/products';
import type { BreadcrumbItem } from '@/types';
import type { FieldOption } from '@/utils/form-fields';
import { parseMaskedFieldValue } from '@/utils/form-fields';
import {
    BARCODE_COLUMN,
    COST_COLUMN,
    INVENTORY_BREADCRUMB,
    INVENTORY_LIST_URL,
    MIN_STOCK_COLUMN,
    NAME_COLUMN,
    SALE_PRICE_COLUMN,
    SKU_COLUMN,
    STOCK_COLUMN,
} from './constants';
import type {
    ApiParams,
    ProductDialogForm,
    ProductDialogSubmitData,
    InventoryFilterOptions,
    InventoryTotals,
    ProductRow,
    UnitProfit,
} from './types';

export function productDetailsUrl(id: number): string {
    return withAppBasePath(`/dashboard/inventory/${id}`);
}

export function getShowBreadcrumbs(productId: number): BreadcrumbItem[] {
    return [
        INVENTORY_BREADCRUMB,
        {
            title: 'Detalhes do produto',
            href: `/dashboard/inventory/${productId}`,
        },
    ];
}

// Remembers the filtered list so "Voltar" returns to it.
let lastInventoryListUrl: string | null = null;

export function openProductDetails(id: number): void {
    lastInventoryListUrl = window.location.href;
    router.visit(productDetailsUrl(id));
}

export function goBackToInventory(): void {
    router.visit(lastInventoryListUrl ?? INVENTORY_LIST_URL);
}

export function useProductsPage(apiParams: ApiParams) {
    return useQuery({
        queryKey: [...productsQueryKey, 'page', apiParams],
        queryFn: () => productService.list(apiParams),
        placeholderData: keepPreviousData,
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: [...productsQueryKey, 'detail', id],
        queryFn: () => productService.get(id),
        retry: false,
    });
}

export async function fetchAllProducts(
    apiParams: ApiParams,
): Promise<Product[]> {
    const filters = Object.fromEntries(
        Object.entries(apiParams).filter(
            ([key]) => key !== 'page' && key !== 'per_page',
        ),
    );
    const response = await productService.list({ ...filters, per_page: 100 });

    return response.data;
}

export function toProductRow(
    product: Product,
    brandNameById: Map<number, string>,
    categoryNameById: Map<number, string>,
): ProductRow {
    return {
        id: String(product.id),
        product,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        cost: product.cost,
        sale_price: product.sale_price,
        stock: product.stock,
        min_stock: product.min_stock,
        categoryName: categoryNameById.get(product.category_id) || '-',
        brandName: brandNameById.get(product.brand_id ?? 0) || 'Sem marca',
    };
}

function brandColumn(
    options: InventoryFilterOptions,
): ServerColumn<ProductRow> {
    return {
        key: 'brandName',
        header: 'Marca',
        filter: {
            type: 'search-select',
            key: 'brand_id',
            options: options.brands,
        },
    };
}

function categoryColumn(
    options: InventoryFilterOptions,
): ServerColumn<ProductRow> {
    return {
        key: 'categoryName',
        header: 'Categoria',
        filter: {
            type: 'search-select',
            key: 'category_id',
            options: options.categories,
        },
    };
}

export function getTableColumns(
    options: InventoryFilterOptions,
): ServerColumn<ProductRow>[] {
    return [
        NAME_COLUMN,
        SKU_COLUMN,
        brandColumn(options),
        categoryColumn(options),
        SALE_PRICE_COLUMN,
        STOCK_COLUMN,
    ];
}

export function getExportColumns(
    options: InventoryFilterOptions,
): ServerColumn<ProductRow>[] {
    return [
        NAME_COLUMN,
        SKU_COLUMN,
        BARCODE_COLUMN,
        brandColumn(options),
        categoryColumn(options),
        COST_COLUMN,
        SALE_PRICE_COLUMN,
        STOCK_COLUMN,
        MIN_STOCK_COLUMN,
    ];
}

export function getInventoryTotals(products: Product[]): InventoryTotals {
    const active = products.filter((product) => product.status === 'active');

    return {
        costValue: active.reduce(
            (sum, product) => sum + product.cost * product.stock,
            0,
        ),
        saleValue: active.reduce(
            (sum, product) => sum + product.sale_price * product.stock,
            0,
        ),
        quantity: active.reduce((sum, product) => sum + product.stock, 0),
    };
}

export function getUnitProfit(product: Product): UnitProfit {
    const profit = product.sale_price - product.cost;
    const margin =
        product.sale_price > 0 ? (profit / product.sale_price) * 100 : 0;

    return { profit, margin };
}

export function makeEmptyProductForm(): ProductDialogForm {
    return {
        name: '',
        sku: '',
        barcode: '',
        cost: '',
        sale_price: '',
        stock: '0',
        min_stock: '0',
        category_id: '',
        brand_id: '',
        description: '',
    };
}

export function normalizeInitialData(
    initialData?: Partial<ProductDialogForm>,
): ProductDialogForm {
    return {
        ...makeEmptyProductForm(),
        ...initialData,
        id: initialData?.id,
        stock: String(initialData?.stock ?? '0'),
        min_stock: String(initialData?.min_stock ?? '0'),
    };
}

export function toProductSubmitData(
    values: ProductDialogForm,
): ProductDialogSubmitData {
    return {
        id: values.id,
        name: values.name.trim(),
        sku: values.sku.trim(),
        barcode: values.barcode.trim() || null,
        description: values.description.trim() || null,
        sale_price: Number(
            parseMaskedFieldValue(values.sale_price, 'currency'),
        ),
        cost: Number(parseMaskedFieldValue(values.cost, 'currency')),
        stock: Math.max(0, Number(values.stock || 0)),
        min_stock: Math.max(0, Number(values.min_stock || 0)),
        category_id: Number(values.category_id),
        brand_id: values.brand_id ? Number(values.brand_id) : null,
    };
}

export function toNonNegativeQuantity(value: string | number): string {
    return String(Math.max(0, Number(value || 0)));
}

export function findOptionLabel(options: FieldOption[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? '';
}

export function toProductFormValues(product: Product): ProductDialogForm {
    return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? '',
        description: product.description ?? '',
        cost: formatCurrencyBR(product.cost),
        sale_price: formatCurrencyBR(product.sale_price),
        stock: String(product.stock),
        min_stock: String(product.min_stock),
        category_id: String(product.category_id),
        brand_id: product.brand_id ? String(product.brand_id) : '',
    };
}
