import { useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useDeleteBrand } from '@/hooks/use-brands';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import type { Brand } from '@/schemas/brand';
import { CreateEditModal } from './components/create-edit-modal';
import {
    BRANDS_BREADCRUMB,
    BRANDS_FILTER_KEYS,
    BRANDS_TITLE,
    BRAND_COLUMNS,
    CREATE_BRAND_ACTION,
} from './utils/constants';
import { fetchAllBrands, toBrandRow, useBrandsPage } from './utils/functions';

export default function BrandsPage() {
    const tableState = useServerTableState({
        filterKeys: BRANDS_FILTER_KEYS,
    });
    const brandsPage = useBrandsPage(tableState.apiParams);
    const deleteBrand = useDeleteBrand();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(CREATE_BRAND_ACTION);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    return (
        <AppLayout breadcrumbs={[BRANDS_BREADCRUMB]}>
            <PageContent>
                <ServerTable
                    title={BRANDS_TITLE}
                    columns={BRAND_COLUMNS}
                    rows={(brandsPage.data?.data ?? []).map(toBrandRow)}
                    total={brandsPage.data?.meta.total ?? 0}
                    lastPage={brandsPage.data?.meta.last_page ?? 1}
                    isLoading={brandsPage.isPending}
                    isFetching={brandsPage.isFetching}
                    state={tableState}
                    onCreate={() => setIsCreateOpen(true)}
                    onEdit={(row) => setEditingBrand(row.brand)}
                    onDelete={async (row) => {
                        await deleteBrand.mutateAsync(row.brand.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllBrands(tableState.apiParams)).map(
                            toBrandRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingBrand ? (
                    <CreateEditModal
                        open
                        onOpenChange={(open) => !open && setEditingBrand(null)}
                        brand={editingBrand}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
