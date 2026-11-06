import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import { toFieldOptions } from '@/utils/form-fields';
import { CreateEditModal } from './components/create-edit-modal';
import { SummaryCards } from './components/summary-cards';
import {
    CREATE_PURCHASE_ACTION,
    PURCHASES_BREADCRUMB,
    PURCHASES_FILTER_KEYS,
} from './utils/constants';
import {
    fetchAllPurchases,
    getExportColumns,
    getTableColumns,
    openPurchaseDetails,
    toPurchaseRow,
    usePurchasesPage,
} from './utils/functions';

export default function PurchasesPage() {
    const tableState = useServerTableState({
        filterKeys: PURCHASES_FILTER_KEYS,
    });
    const purchasesPage = usePurchasesPage(tableState.apiParams);
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(
        CREATE_PURCHASE_ACTION,
    );

    const filterOptions = {
        brands: toFieldOptions(brands),
        categories: toFieldOptions(categories),
    };

    return (
        <AppLayout breadcrumbs={[PURCHASES_BREADCRUMB]}>
            <PageContent>
                <SummaryCards apiParams={tableState.apiParams} />

                <ServerTable
                    title="Compras"
                    columns={getTableColumns(
                        filterOptions,
                        tableState.filters.product,
                    )}
                    exportColumns={getExportColumns()}
                    rows={(purchasesPage.data?.data ?? []).map(toPurchaseRow)}
                    total={purchasesPage.data?.meta.total ?? 0}
                    lastPage={purchasesPage.data?.meta.last_page ?? 1}
                    isLoading={purchasesPage.isPending}
                    isFetching={purchasesPage.isFetching}
                    state={tableState}
                    filterLabels={{
                        id: (id) => `Compra #${id}`,
                    }}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openPurchaseDetails(row.purchase.id)}
                    loadAllForExport={async () =>
                        (await fetchAllPurchases(tableState.apiParams)).map(
                            toPurchaseRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />
            </PageContent>
        </AppLayout>
    );
}
