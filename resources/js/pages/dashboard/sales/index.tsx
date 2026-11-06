import { useState } from 'react';
import { toast } from 'sonner';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import type { Sale } from '@/schemas/sale';
import { saleService } from '@/services/sales';
import { toFieldOptions } from '@/utils/form-fields';
import { CreateEditModal } from './components/create-edit-modal';
import { PrintPreviewDialog } from './components/print-preview-dialog';
import { SummaryCards } from './components/summary-cards';
import {
    CREATE_SALE_ACTION,
    SALE_MESSAGES,
    SALES_BREADCRUMB,
    SALES_FILTER_KEYS,
} from './utils/constants';
import {
    fetchAllSales,
    getExportColumns,
    getTableColumns,
    openSaleDetails,
    toSaleRow,
    useSalesPage,
} from './utils/functions';

export default function SalesPage() {
    const tableState = useServerTableState({ filterKeys: SALES_FILTER_KEYS });
    const salesPage = useSalesPage(tableState.apiParams);
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(CREATE_SALE_ACTION);
    const [printSale, setPrintSale] = useState<Sale | null>(null);

    const filterOptions = {
        brands: toFieldOptions(brands),
        categories: toFieldOptions(categories),
    };

    const openPrint = async (saleId: number) => {
        try {
            setPrintSale(await saleService.get(saleId));
        } catch {
            toast.error(SALE_MESSAGES.printError);
        }
    };

    return (
        <AppLayout breadcrumbs={[SALES_BREADCRUMB]}>
            <PageContent>
                <SummaryCards apiParams={tableState.apiParams} />

                <ServerTable
                    title="Vendas"
                    columns={getTableColumns(filterOptions)}
                    exportColumns={getExportColumns()}
                    rows={(salesPage.data?.data ?? []).map(toSaleRow)}
                    total={salesPage.data?.meta.total ?? 0}
                    lastPage={salesPage.data?.meta.last_page ?? 1}
                    isLoading={salesPage.isPending}
                    isFetching={salesPage.isFetching}
                    state={tableState}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openSaleDetails(row.sale.id)}
                    onPrint={(row) => void openPrint(row.sale.id)}
                    loadAllForExport={async () =>
                        (await fetchAllSales(tableState.apiParams)).map(
                            toSaleRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                <PrintPreviewDialog
                    key={printSale?.id ?? 'none'}
                    open={printSale !== null}
                    onOpenChange={(open) => !open && setPrintSale(null)}
                    sale={printSale}
                    initialMode="thermal"
                />
            </PageContent>
        </AppLayout>
    );
}
