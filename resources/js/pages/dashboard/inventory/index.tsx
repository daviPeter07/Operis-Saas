import { useMemo, useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteProduct } from '@/hooks/use-products';
import { useServerTableState } from '@/hooks/use-server-table-state';
import AppLayout from '@/layouts/app-layout';
import type { Product } from '@/schemas/product';
import { toFieldOptions } from '@/utils/form-fields';
import { CreateEditModal } from './components/create-edit-modal';
import { SummaryCards } from './components/summary-cards';
import {
    INVENTORY_BREADCRUMB,
    INVENTORY_DEFAULT_FILTERS,
    INVENTORY_FILTER_KEYS,
    NEGATIVE_STOCK_ROW_CLASS,
} from './utils/constants';
import {
    fetchAllProducts,
    getExportColumns,
    getTableColumns,
    openProductDetails,
    toProductRow,
    useProductsPage,
} from './utils/functions';

export default function InventoryPage() {
    const tableState = useServerTableState({
        filterKeys: INVENTORY_FILTER_KEYS,
        defaultFilters: INVENTORY_DEFAULT_FILTERS,
    });
    const productsPage = useProductsPage(tableState.apiParams);
    const { data: brands = [], isPending: isBrandsPending } = useBrands();
    const { data: categories = [], isPending: isCategoriesPending } =
        useCategories();
    const deleteProduct = useDeleteProduct();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const brandNameById = useMemo(
        () => new Map(brands.map((brand) => [brand.id, brand.name])),
        [brands],
    );
    const categoryNameById = useMemo(
        () =>
            new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );
    const filterOptions = {
        brands: toFieldOptions(brands),
        categories: toFieldOptions(categories),
    };

    const toRow = (product: Product) =>
        toProductRow(product, brandNameById, categoryNameById);

    return (
        <AppLayout breadcrumbs={[INVENTORY_BREADCRUMB]}>
            <PageContent>
                <SummaryCards />

                <ServerTable
                    title="Estoque"
                    columns={getTableColumns(filterOptions)}
                    exportColumns={getExportColumns(filterOptions)}
                    rows={(productsPage.data?.data ?? []).map(toRow)}
                    total={productsPage.data?.meta.total ?? 0}
                    lastPage={productsPage.data?.meta.last_page ?? 1}
                    isLoading={
                        productsPage.isPending ||
                        isBrandsPending ||
                        isCategoriesPending
                    }
                    isFetching={productsPage.isFetching}
                    state={tableState}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openProductDetails(row.product.id)}
                    onEdit={(row) => setEditingProduct(row.product)}
                    onDelete={async (row) => {
                        await deleteProduct.mutateAsync(row.product.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllProducts(tableState.apiParams)).map(
                            toRow,
                        )
                    }
                    rowClassName={(row) =>
                        row.stock < 0 ? NEGATIVE_STOCK_ROW_CLASS : undefined
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingProduct ? (
                    <CreateEditModal
                        open
                        onOpenChange={(open) =>
                            !open && setEditingProduct(null)
                        }
                        product={editingProduct}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
