import { useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useDeleteService } from '@/hooks/use-services';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import type { Service } from '@/schemas/service';
import { CreateEditModal } from './components/create-edit-modal';
import {
    CREATE_SERVICE_ACTION,
    SERVICES_BREADCRUMB,
    SERVICES_FILTER_KEYS,
    SERVICES_TITLE,
    SERVICE_COLUMNS,
    SERVICE_EXPORT_COLUMNS,
} from './utils/constants';
import {
    fetchAllServices,
    toServiceRow,
    useServicesPage,
} from './utils/functions';

export default function ServicesPage() {
    const tableState = useServerTableState({
        filterKeys: SERVICES_FILTER_KEYS,
    });
    const servicesPage = useServicesPage(tableState.apiParams);
    const deleteService = useDeleteService();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(CREATE_SERVICE_ACTION);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const rows = (servicesPage.data?.data ?? []).map(toServiceRow);

    return (
        <AppLayout breadcrumbs={[SERVICES_BREADCRUMB]}>
            <PageContent>
                <ServerTable
                    title={SERVICES_TITLE}
                    columns={SERVICE_COLUMNS}
                    exportColumns={SERVICE_EXPORT_COLUMNS}
                    rows={rows}
                    total={servicesPage.data?.meta.total ?? 0}
                    lastPage={servicesPage.data?.meta.last_page ?? 1}
                    isLoading={servicesPage.isPending}
                    isFetching={servicesPage.isFetching}
                    state={tableState}
                    showView={false}
                    filterLabels={{
                        id: (id) =>
                            `Serviço: ${rows.find((row) => row.id === id)?.name ?? `#${id}`}`,
                    }}
                    onCreate={() => setIsCreateOpen(true)}
                    onEdit={(row) => setEditingService(row.service)}
                    onDelete={async (row) => {
                        await deleteService.mutateAsync(row.service.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllServices(tableState.apiParams)).map(
                            toServiceRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingService ? (
                    <CreateEditModal
                        open
                        onOpenChange={(open) =>
                            !open && setEditingService(null)
                        }
                        service={editingService}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
