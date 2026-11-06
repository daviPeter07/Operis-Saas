import { useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useDeleteSupplier } from '@/hooks/use-suppliers';
import AppLayout from '@/layouts/app-layout';
import type { Supplier } from '@/schemas/supplier';
import { SupplierCreateDialog } from './components/create-edit-modal';
import {
    EXPORT_COLUMNS,
    SUPPLIERS_BREADCRUMB,
    SUPPLIERS_FILTER_KEYS,
    TABLE_COLUMNS,
} from './utils/constants';
import {
    fetchAllSuppliers,
    openSupplierDetails,
    toSupplierRow,
    useSuppliersPage,
} from './utils/functions';

export default function SuppliersPage() {
    const tableState = useServerTableState({
        filterKeys: SUPPLIERS_FILTER_KEYS,
    });
    const suppliersPage = useSuppliersPage(tableState.apiParams);
    const deleteSupplier = useDeleteSupplier();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
        null,
    );

    return (
        <AppLayout breadcrumbs={[SUPPLIERS_BREADCRUMB]}>
            <PageContent>
                <ServerTable
                    title="Fornecedores"
                    columns={TABLE_COLUMNS}
                    exportColumns={EXPORT_COLUMNS}
                    rows={(suppliersPage.data?.data ?? []).map(toSupplierRow)}
                    total={suppliersPage.data?.meta.total ?? 0}
                    lastPage={suppliersPage.data?.meta.last_page ?? 1}
                    isLoading={suppliersPage.isPending}
                    isFetching={suppliersPage.isFetching}
                    state={tableState}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openSupplierDetails(row.supplier.id)}
                    onEdit={(row) => setEditingSupplier(row.supplier)}
                    onDelete={async (row) => {
                        await deleteSupplier.mutateAsync(row.supplier.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllSuppliers(tableState.apiParams)).map(
                            toSupplierRow,
                        )
                    }
                />

                <SupplierCreateDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingSupplier ? (
                    <SupplierCreateDialog
                        open
                        onOpenChange={(open) =>
                            !open && setEditingSupplier(null)
                        }
                        supplier={editingSupplier}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
