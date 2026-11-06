import { useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useDeleteCustomer } from '@/hooks/use-customers';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import type { Customer } from '@/schemas/customer';
import { CreateEditModal } from './components/create-edit-modal';
import {
    CLIENTS_BREADCRUMB,
    CLIENTS_FILTER_KEYS,
    CREATE_CLIENT_ACTION,
    EXPORT_COLUMNS,
    TABLE_COLUMNS,
} from './utils/constants';
import {
    fetchAllCustomers,
    openClientDetails,
    toClientRow,
    useCustomersPage,
} from './utils/functions';

export default function ClientsPage() {
    const tableState = useServerTableState({ filterKeys: CLIENTS_FILTER_KEYS });
    const customersPage = useCustomersPage(tableState.apiParams);
    const deleteCustomer = useDeleteCustomer();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(CREATE_CLIENT_ACTION);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
        null,
    );

    return (
        <AppLayout breadcrumbs={[CLIENTS_BREADCRUMB]}>
            <PageContent>
                <ServerTable
                    title="Clientes"
                    columns={TABLE_COLUMNS}
                    exportColumns={EXPORT_COLUMNS}
                    rows={(customersPage.data?.data ?? []).map(toClientRow)}
                    total={customersPage.data?.meta.total ?? 0}
                    lastPage={customersPage.data?.meta.last_page ?? 1}
                    isLoading={customersPage.isPending}
                    isFetching={customersPage.isFetching}
                    state={tableState}
                    filterLabels={{
                        id: (id) =>
                            `Cliente: ${customersPage.data?.data.find((customer) => String(customer.id) === id)?.name ?? `#${id}`}`,
                    }}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openClientDetails(row.customer.id)}
                    onEdit={(row) => setEditingCustomer(row.customer)}
                    onDelete={async (row) => {
                        await deleteCustomer.mutateAsync(row.customer.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllCustomers(tableState.apiParams)).map(
                            toClientRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingCustomer ? (
                    <CreateEditModal
                        open
                        onOpenChange={(open) =>
                            !open && setEditingCustomer(null)
                        }
                        customer={editingCustomer}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
