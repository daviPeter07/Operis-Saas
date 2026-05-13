import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useAccountReceivables,
    useCreateManualAccountReceivable,
    useSettleAccountReceivable,
    useUpdateAccountReceivable,
    useUnsettleAccountReceivable,
} from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { AccountsReceivableCreateDialog } from './accounts-receivable-create-dialog';
import { AccountsReceivableHeader } from './accounts-receivable-header';

type ReceivableRow = {
    id: string;
    customer_id: number | null;
    customer_name: string;
    sale_id: number | null;
    installment_number: number | null;
    total_installments: number | null;
    item: string | null;
    description: string | null;
    amount: number;
    due_date: string | null;
    entry_date: string | null;
    status: string;
    received_at: string | null;
};

function hasSameReceivableMetricsRows(
    previous: ReceivableRow[],
    next: ReceivableRow[],
): boolean {
    if (previous.length !== next.length) {
        return false;
    }

    for (let index = 0; index < previous.length; index += 1) {
        const prevRow = previous[index];
        const nextRow = next[index];

        if (
            prevRow.id !== nextRow.id ||
            prevRow.status !== nextRow.status ||
            prevRow.amount !== nextRow.amount
        ) {
            return false;
        }
    }

    return true;
}

export function AccountsReceivableModule() {
    const { data: receivables = [], isPending: isReceivablesPending } =
        useAccountReceivables();
    const { data: customers = [], isPending: isCustomersPending } =
        useCustomers();
    const createManualReceivable = useCreateManualAccountReceivable();
    const updateAccountReceivable = useUpdateAccountReceivable();
    const settleAccountReceivable = useSettleAccountReceivable();
    const unsettleAccountReceivable = useUnsettleAccountReceivable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filteredRows, setFilteredRows] = useState<ReceivableRow[]>([]);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchAction, setBatchAction] = useState<
        'pending' | 'received' | null
    >(null);
    const [processingSnapshot, setProcessingSnapshot] = useState<{
        count: number;
        total: number;
    } | null>(null);

    const customerNameById = useMemo(
        () =>
            new Map(customers.map((customer) => [customer.id, customer.name])),
        [customers],
    );

    const rows: ReceivableRow[] = receivables.map((receivable) => ({
        id: String(receivable.id),
        customer_id: receivable.customer_id,
        customer_name: receivable.customer_id
            ? (customerNameById.get(receivable.customer_id) ??
              `#${receivable.customer_id}`)
            : 'Sem cliente',
        sale_id: receivable.sale_id,
        installment_number: receivable.installment_number,
        total_installments: receivable.total_installments ?? null,
        item: receivable.item,
        description: receivable.description,
        amount: receivable.amount,
        due_date: receivable.due_date,
        entry_date: receivable.entry_date,
        status: receivable.status,
        received_at: receivable.received_at,
    }));

    const handleSelectOne = (id: string, checked: boolean) => {
        const next = new Set(selectedIds);

        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }

        setSelectedIds(next);
    };

    const handleConfirmReceipt = () => {
        const ids = rows
            .filter(
                (row) => selectedIds.has(row.id) && row.status === 'pending',
            )
            .map((row) => Number(row.id));

        if (ids.length === 0) {
            return;
        }

        const selectedForAction = rows.filter((row) => selectedIds.has(row.id));
        setBatchAction('pending');
        setIsBatchProcessing(true);
        setProcessingSnapshot({
            count: selectedForAction.length,
            total: selectedForAction.reduce((sum, row) => sum + row.amount, 0),
        });

        void Promise.allSettled(
            ids.map((id) =>
                settleAccountReceivable.mutateAsync({
                    id,
                    received_at: new Date().toISOString().slice(0, 10),
                }),
            ),
        ).then((results) => {
            setIsBatchProcessing(false);
            setBatchAction(null);
            setProcessingSnapshot(null);
            setSelectedIds(new Set());
            const failed = results.filter(
                (result) => result.status === 'rejected',
            ).length;

            if (failed > 0) {
                toast.error(
                    `${failed} de ${ids.length} baixa(s) falharam. Tente novamente.`,
                );

                return;
            }

            toast.success(`${ids.length} conta(s) baixada(s) com sucesso.`);
        });
    };

    const handleUndoReceipt = () => {
        const ids = rows
            .filter(
                (row) => selectedIds.has(row.id) && row.status === 'received',
            )
            .map((row) => Number(row.id));

        if (ids.length === 0) {
            return;
        }

        const selectedForAction = rows.filter((row) => selectedIds.has(row.id));
        setBatchAction('received');
        setIsBatchProcessing(true);
        setProcessingSnapshot({
            count: selectedForAction.length,
            total: selectedForAction.reduce((sum, row) => sum + row.amount, 0),
        });

        void Promise.allSettled(
            ids.map((id) => unsettleAccountReceivable.mutateAsync(id)),
        ).then((results) => {
            setIsBatchProcessing(false);
            setBatchAction(null);
            setProcessingSnapshot(null);
            setSelectedIds(new Set());
            const failed = results.filter(
                (result) => result.status === 'rejected',
            ).length;

            if (failed > 0) {
                toast.error(
                    `${failed} de ${ids.length} estorno(s) falharam. Tente novamente.`,
                );

                return;
            }

            toast.success(`${ids.length} baixa(s) desfeita(s) com sucesso.`);
        });
    };

    const totalSelected = selectedIds.size;
    const selectedRows = rows.filter((row) => selectedIds.has(row.id));
    const selectedStatuses = new Set(selectedRows.map((row) => row.status));
    const selectedAction =
        selectedRows.length > 0 && selectedStatuses.size === 1
            ? selectedRows[0].status
            : null;
    const totalValue = selectedRows.reduce((sum, row) => sum + row.amount, 0);
    const displaySelectedCount = processingSnapshot?.count ?? totalSelected;
    const displayTotalValue = processingSnapshot?.total ?? totalValue;
    const isProcessingReceiptAction =
        isBatchProcessing ||
        settleAccountReceivable.isPending ||
        unsettleAccountReceivable.isPending;

    const handleFilteredDataChange = useCallback((nextRows: ReceivableRow[]) => {
        setFilteredRows((previous) =>
            hasSameReceivableMetricsRows(previous, nextRows)
                ? previous
                : nextRows,
        );
    }, []);

    const metrics = useMemo(() => {
        const baseRows = filteredRows;

        return {
            totalTitles: baseRows.length,
            pendingAmount: baseRows
                .filter((row) => row.status === 'pending')
                .reduce((sum, row) => sum + row.amount, 0),
            receivedAmount: baseRows
                .filter((row) => row.status === 'received')
                .reduce((sum, row) => sum + row.amount, 0),
        };
    }, [filteredRows]);

    const columns: Column<ReceivableRow>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={
                        selectedIds.size === rows.length && rows.length > 0
                    }
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                selectedIds.size > 0 &&
                                selectedIds.size < rows.length;
                        }
                    }}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(new Set(rows.map((row) => row.id)));
                        } else {
                            setSelectedIds(new Set());
                        }
                    }}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
            render: (_, row: ReceivableRow) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
        },
        {
            key: 'customer_name',
            header: 'Cliente',
        },
        {
            key: 'item',
            header: 'Descricao',
            render: (val: unknown) => String(val || '-'),
        },
        {
            key: 'installment_number',
            header: 'Parcela',
            render: (val: unknown, row: ReceivableRow) => {
                if (val === null || val === undefined) {
                    return '-';
                }

                const current = Number(val);
                const total = row.total_installments;

                if (total && total >= 1) {
                    return `${current}/${total}`;
                }

                return String(val);
            },
        },
        {
            key: 'sale_id',
            header: 'Origem',
            render: (_, row: ReceivableRow) =>
                row.sale_id ? `Venda #${row.sale_id}` : 'Manual',
        },
        {
            key: 'amount',
            header: 'Valor',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
        {
            key: 'due_date',
            header: 'Vencimento',
            render: (value: unknown) =>
                value ? formatDateBR(String(value)) : '-',
        },
        {
            key: 'entry_date',
            header: 'Lancamento',
            render: (value: unknown) =>
                value ? formatDateBR(String(value)) : '-',
        },
    ];

    return (
        <div className="space-y-4">
            <AccountsReceivableHeader
                metrics={metrics}
                loading={
                    isReceivablesPending ||
                    isCustomersPending ||
                    isProcessingReceiptAction
                }
            />

            {(totalSelected > 0 || processingSnapshot !== null) && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                        <p className="font-medium">
                            {displaySelectedCount} selecionada(s)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Total: {formatCurrencyBR(displayTotalValue)}
                        </p>
                        {!isProcessingReceiptAction && selectedAction === null && (
                            <p className="text-sm text-amber-600">
                                Selecione apenas títulos com o mesmo status para
                                aplicar a ação.
                            </p>
                        )}
                    </div>
                    {(selectedAction === 'pending' || batchAction === 'pending') && (
                        <button
                            onClick={() => void handleConfirmReceipt()}
                            disabled={isProcessingReceiptAction}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessingReceiptAction
                                ? 'Processando...'
                                : 'Marcar como Recebida'}
                        </button>
                    )}
                    {(selectedAction === 'received' ||
                        batchAction === 'received') && (
                        <button
                            onClick={() => void handleUndoReceipt()}
                            disabled={isProcessingReceiptAction}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessingReceiptAction
                                ? 'Processando...'
                                : 'Desfazer baixa'}
                        </button>
                    )}
                </div>
            )}
            <GenericTable
                data={rows}
                columns={columns}
                title="Contas a Receber"
                loading={isReceivablesPending || isCustomersPending}
                sortableColumns={[
                    { key: 'customer_name', type: 'text' },
                    { key: 'item', type: 'text' },
                    { key: 'installment_number', type: 'number' },
                    { key: 'due_date', type: 'date' },
                    { key: 'entry_date', type: 'date' },
                ]}
                dateFilterKey="due_date"
                onFilteredDataChange={handleFilteredDataChange}
                clickableRow
                onRowClick={(row) =>
                    handleSelectOne(row.id, !selectedIds.has(row.id))
                }
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                createDialog={({ open, onOpenChange }) => (
                    <AccountsReceivableCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        customers={customers.map((customer) => ({
                            id: String(customer.id),
                            name: customer.name,
                            email: customer.email ?? '',
                            phone: customer.phone ?? '',
                            document: customer.document ?? '',
                            city: '',
                            state: '',
                            address: '',
                            createdAt: new Date().toISOString().slice(0, 10),
                            creditEnabled: customer.credit_enabled,
                            creditLimit: Number(customer.credit_limit ?? 0),
                            creditTermDays: Number(
                                customer.credit_term_days ?? 30,
                            ),
                        }))}
                        onSubmit={async (payload) => {
                            await createManualReceivable.mutateAsync(payload);
                            toast.success(
                                'Conta a receber criada com sucesso.',
                            );
                        }}
                    />
                )}
                editDialog={({ open, onOpenChange, row }) => (
                    <AccountsReceivableCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        mode="edit"
                        initialData={{
                            customer_id: row.customer_id ?? 0,
                            item: row.item ?? '',
                            description: row.description,
                            amount: row.amount,
                            entry_date:
                                row.entry_date ??
                                new Date().toISOString().slice(0, 10),
                        }}
                        customers={customers.map((customer) => ({
                            id: String(customer.id),
                            name: customer.name,
                            email: customer.email ?? '',
                            phone: customer.phone ?? '',
                            document: customer.document ?? '',
                            city: '',
                            state: '',
                            address: '',
                            createdAt: new Date().toISOString().slice(0, 10),
                            creditEnabled: customer.credit_enabled,
                            creditLimit: Number(customer.credit_limit ?? 0),
                            creditTermDays: Number(
                                customer.credit_term_days ?? 30,
                            ),
                        }))}
                        onSubmit={async (payload) => {
                            await updateAccountReceivable.mutateAsync({
                                id: Number(row.id),
                                data: payload,
                            });
                            toast.success(
                                'Conta a receber atualizada com sucesso.',
                            );
                            onOpenChange(false);
                        }}
                    />
                )}
            />
        </div>
    );
}
