import { useState } from 'react';
import { toast } from 'sonner';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useDeleteAccountReceivable } from '@/hooks/use-account-receivables';
import { useServerTableState } from '@/hooks/use-server-table-state';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { OriginFilterNotice } from './components/origin-filter-notice';
import { PartialSettleDialog } from './components/partial-settle-dialog';
import { SelectionBar } from './components/selection-bar';
import { SummaryCards } from './components/summary-cards';
import {
    RECEIVABLE_MESSAGES,
    RECEIVABLES_BREADCRUMB,
    RECEIVABLES_FILTER_KEYS,
} from './utils/constants';
import {
    fetchAllReceivables,
    getErrorMessage,
    getExportColumns,
    getTableColumns,
    isOpenStatus,
    openReceivableDetails,
    toReceivableRow,
    useReceiptActions,
    useReceivablesPage,
} from './utils/functions';
import type { ReceivableRow } from './utils/types';

export default function AccountsReceivablePage() {
    const tableState = useServerTableState({
        filterKeys: RECEIVABLES_FILTER_KEYS,
    });
    const receivablesPage = useReceivablesPage(tableState.apiParams);
    const deleteReceivable = useDeleteAccountReceivable();
    const actions = useReceiptActions();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Map<string, ReceivableRow>>(
        new Map(),
    );
    const [isPartialOpen, setIsPartialOpen] = useState(false);

    const rows = (receivablesPage.data?.data ?? []).map(toReceivableRow);
    const selectedRows = [...selected.values()];
    const selectedIds = selectedRows.map((row) => row.receivable.id);
    const partialRow =
        selectedRows.length === 1 && isOpenStatus(selectedRows[0].status)
            ? selectedRows[0]
            : null;

    const toggle = (changed: ReceivableRow[], checked: boolean) =>
        setSelected((current) => {
            const next = new Map(current);

            changed.forEach((row) =>
                checked ? next.set(row.id, row) : next.delete(row.id),
            );

            return next;
        });

    const clearAfter = async (task: Promise<boolean>) => {
        if (await task) {
            setSelected(new Map());
        }
    };

    return (
        <AppLayout breadcrumbs={[RECEIVABLES_BREADCRUMB]}>
            <PageContent>
                <SummaryCards apiParams={tableState.apiParams} />

                {tableState.filters.sale ? (
                    <OriginFilterNotice
                        originId={tableState.filters.sale}
                        onClear={() => tableState.setFilter('sale', '')}
                    />
                ) : null}

                <ServerTable
                    title="Contas a Receber"
                    columns={getTableColumns()}
                    exportColumns={getExportColumns()}
                    rows={rows}
                    total={receivablesPage.data?.meta.total ?? 0}
                    lastPage={receivablesPage.data?.meta.last_page ?? 1}
                    isLoading={receivablesPage.isPending}
                    isFetching={receivablesPage.isFetching}
                    state={tableState}
                    selection={{
                        selectedIds: new Set(selected.keys()),
                        onChange: (row, checked) => toggle([row], checked),
                        onChangePage: toggle,
                    }}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openReceivableDetails(row.receivable.id)}
                    onDelete={async (row) => {
                        try {
                            await deleteReceivable.mutateAsync(
                                row.receivable.id,
                            );
                            toggle([row], false);
                            toast.success(RECEIVABLE_MESSAGES.deleteSuccess);
                        } catch (error) {
                            toast.error(
                                getErrorMessage(
                                    error,
                                    RECEIVABLE_MESSAGES.deleteError,
                                ),
                            );
                        }
                    }}
                    itemName={(row) => row.description}
                    loadAllForExport={async () =>
                        (await fetchAllReceivables(tableState.apiParams)).map(
                            toReceivableRow,
                        )
                    }
                />

                {selectedRows.length > 0 ? (
                    <SelectionBar
                        rows={selectedRows}
                        isProcessing={actions.isProcessing}
                        onSettle={() =>
                            void clearAfter(actions.settle(selectedIds))
                        }
                        onUndo={() =>
                            void clearAfter(actions.undo(selectedIds))
                        }
                        onPartial={() => setIsPartialOpen(true)}
                        onClear={() => setSelected(new Map())}
                    />
                ) : null}

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                <PartialSettleDialog
                    key={partialRow?.id ?? 'none'}
                    open={isPartialOpen && partialRow !== null}
                    onOpenChange={setIsPartialOpen}
                    row={partialRow}
                    isSubmitting={actions.isProcessing}
                    onConfirm={(amount) => {
                        if (!partialRow) {
                            return;
                        }

                        void actions
                            .partial(partialRow.receivable.id, amount)
                            .then((done) => {
                                if (done) {
                                    setIsPartialOpen(false);
                                    setSelected(new Map());
                                }
                            });
                    }}
                />
            </PageContent>
        </AppLayout>
    );
}
