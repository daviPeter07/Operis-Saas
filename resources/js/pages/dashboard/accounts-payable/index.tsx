import { useState } from 'react';
import { toast } from 'sonner';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useDeleteAccountPayable } from '@/hooks/use-account-payables';
import { useServerTableState } from '@/hooks/use-server-table-state';
import AppLayout from '@/layouts/app-layout';
import { CreateEditModal } from './components/create-edit-modal';
import { PartialSettleDialog } from './components/partial-settle-dialog';
import { SelectionBar } from './components/selection-bar';
import { SummaryCards } from './components/summary-cards';
import {
    PAYABLE_MESSAGES,
    PAYABLES_BREADCRUMB,
    PAYABLES_FILTER_KEYS,
} from './utils/constants';
import {
    fetchAllPayables,
    getErrorMessage,
    getExportColumns,
    getTableColumns,
    isOpenStatus,
    openPayableDetails,
    toPayableRow,
    usePaymentActions,
    usePayablesPage,
} from './utils/functions';
import type { PayableRow } from './utils/types';

export default function AccountsPayablePage() {
    const tableState = useServerTableState({
        filterKeys: PAYABLES_FILTER_KEYS,
    });
    const payablesPage = usePayablesPage(tableState.apiParams);
    const deletePayable = useDeleteAccountPayable();
    const actions = usePaymentActions();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Map<string, PayableRow>>(
        new Map(),
    );
    const [isPartialOpen, setIsPartialOpen] = useState(false);

    const rows = (payablesPage.data?.data ?? []).map(toPayableRow);
    const selectedRows = [...selected.values()];
    const selectedIds = selectedRows.map((row) => row.payable.id);
    const partialRow =
        selectedRows.length === 1 && isOpenStatus(selectedRows[0].status)
            ? selectedRows[0]
            : null;

    const toggle = (changed: PayableRow[], checked: boolean) =>
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
        <AppLayout breadcrumbs={[PAYABLES_BREADCRUMB]}>
            <PageContent>
                <SummaryCards apiParams={tableState.apiParams} />

                <ServerTable
                    title="Contas a Pagar"
                    columns={getTableColumns()}
                    exportColumns={getExportColumns()}
                    rows={rows}
                    total={payablesPage.data?.meta.total ?? 0}
                    lastPage={payablesPage.data?.meta.last_page ?? 1}
                    isLoading={payablesPage.isPending}
                    isFetching={payablesPage.isFetching}
                    state={tableState}
                    filterLabels={{
                        purchase: (id) => `contas da Compra #${id}`,
                    }}
                    selection={{
                        selectedIds: new Set(selected.keys()),
                        onChange: (row, checked) => toggle([row], checked),
                        onChangePage: toggle,
                    }}
                    onCreate={() => setIsCreateOpen(true)}
                    onView={(row) => openPayableDetails(row.payable.id)}
                    onDelete={async (row) => {
                        try {
                            await deletePayable.mutateAsync(row.payable.id);
                            toggle([row], false);
                            toast.success(PAYABLE_MESSAGES.deleteSuccess);
                        } catch (error) {
                            toast.error(
                                getErrorMessage(
                                    error,
                                    PAYABLE_MESSAGES.deleteError,
                                ),
                            );
                        }
                    }}
                    itemName={(row) => row.description}
                    loadAllForExport={async () =>
                        (await fetchAllPayables(tableState.apiParams)).map(
                            toPayableRow,
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
                            .partial(partialRow.payable.id, amount)
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
