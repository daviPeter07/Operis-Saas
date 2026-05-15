import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useAccountPayables,
    useCreateManualAccountPayable,
    useSettleAccountPayable,
    useUpdateAccountPayable,
    useUnsettleAccountPayable,
    usePartialSettleAccountPayable,
} from '@/hooks/use-account-payables';
import { useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { UiSupplier } from '@/types/dashboard-entities';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/form-fields';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { AccountsPayableCreateDialog } from './accounts-payable-create-dialog';
import { AccountsPayableHeader } from './accounts-payable-header';

type PayableRow = {
    id: string;
    supplier_id: number | null;
    supplier_name: string;
    purchase_id: number | null;
    installment_number: number | null;
    total_installments: number | null;
    item: string | null;
    description: string | null;
    amount: number;
    amount_paid: number;
    remaining_balance: number;
    item_quantity: number | null;
    due_date: string;
    status: string;
    paid_at: string | null;
    paid_method: string | null;
};

function hasSamePayableMetricsRows(
    previous: PayableRow[],
    next: PayableRow[],
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

export function AccountsPayableModule() {
    const initialStatusFilter =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('status')
            : null;
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter ?? '');
    const { data: payables = [], isPending: isPayablesPending } =
        useAccountPayables();
    const { data: suppliers = [] } = useSuppliers();
    const createManualPayable = useCreateManualAccountPayable();
    const updateAccountPayable = useUpdateAccountPayable();

    const settleAccountPayable = useSettleAccountPayable();
    const unsettleAccountPayable = useUnsettleAccountPayable();
    const partialSettleAccountPayable = usePartialSettleAccountPayable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filteredRows, setFilteredRows] = useState<PayableRow[]>([]);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchAction, setBatchAction] = useState<'pending' | 'paid' | null>(
        null,
    );
    const [processingSnapshot, setProcessingSnapshot] = useState<{
        count: number;
        total: number;
    } | null>(null);
    const [isPartialDialogOpen, setIsPartialDialogOpen] = useState(false);
    const [partialAmountInput, setPartialAmountInput] = useState('');

    const mappedSuppliers = useMemo<UiSupplier[]>(
        () =>
            suppliers.map((supplier) => ({
                id: String(supplier.id),
                name: supplier.name,
                email: supplier.email ?? '',
                phone: supplier.phone ?? '',
                document: supplier.document ?? '',
                city: '',
                state: '',
                address: '',
                createdAt: new Date().toISOString().slice(0, 10),
            })),
        [suppliers],
    );

    const dialogSupplierOptions = useMemo(() => mappedSuppliers, [mappedSuppliers]);

    const supplierNameById = useMemo(
        () =>
            new Map(suppliers.map((supplier) => [supplier.id, supplier.name])),
        [suppliers],
    );

    const rows: PayableRow[] = payables
        .filter((payable) => {
            if (!statusFilter) {
                return true;
            }

            return payable.status === statusFilter;
        })
        .map((payable) => ({
            id: String(payable.id),
            supplier_id: payable.supplier_id,
            supplier_name: payable.supplier_id
                ? (supplierNameById.get(payable.supplier_id) ??
                  `#${payable.supplier_id}`)
                : '-',
            purchase_id: payable.purchase_id,
            installment_number: payable.installment_number,
            total_installments: payable.total_installments ?? null,
            item: payable.item,
            description: payable.description,
            amount: payable.amount,
            amount_paid: payable.amount_paid ?? 0,
            remaining_balance: payable.remaining_balance ?? payable.amount,
            item_quantity: payable.item_quantity ?? null,
            due_date: payable.due_date,
            status: payable.status,
            paid_at: payable.paid_at,
            paid_method: payable.paid_method,
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

    const handleConfirmPayment = () => {
        const ids = rows
            .filter(
                (row) =>
                    selectedIds.has(row.id) &&
                    (row.status === 'pending' || row.status === 'partial'),
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
                settleAccountPayable.mutateAsync({
                    id,
                    paid_at: new Date().toISOString().slice(0, 10),
                    paid_method: 'pix',
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

    const handleUndoPayment = () => {
        const ids = rows
            .filter((row) => selectedIds.has(row.id) && row.status === 'paid')
            .map((row) => Number(row.id));

        if (ids.length === 0) {
            return;
        }

        const selectedForAction = rows.filter((row) => selectedIds.has(row.id));
        setBatchAction('paid');
        setIsBatchProcessing(true);
        setProcessingSnapshot({
            count: selectedForAction.length,
            total: selectedForAction.reduce((sum, row) => sum + row.amount, 0),
        });

        void Promise.allSettled(
            ids.map((id) => unsettleAccountPayable.mutateAsync(id)),
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
    const isProcessingPayableAction =
        isBatchProcessing ||
        settleAccountPayable.isPending ||
        unsettleAccountPayable.isPending ||
        partialSettleAccountPayable.isPending;

    const selectedPendingOrPartialRows = selectedRows.filter(
        (row) => row.status === 'pending' || row.status === 'partial',
    );
    const selectedSingleRow =
        selectedPendingOrPartialRows.length === 1
            ? selectedPendingOrPartialRows[0]
            : null;

    const handleFilteredDataChange = useCallback((nextRows: PayableRow[]) => {
        setFilteredRows((previous) =>
            hasSamePayableMetricsRows(previous, nextRows) ? previous : nextRows,
        );
    }, []);

    const metrics = useMemo(() => {
        const baseRows = filteredRows;

        return {
            totalTitles: baseRows.length,
            totalAmount: baseRows.reduce((sum, row) => sum + row.amount, 0),
            pendingAmount: baseRows
                .filter((row) => row.status === 'pending')
                .reduce((sum, row) => sum + row.amount, 0),
            paidAmount: baseRows
                .filter((row) => row.status === 'paid')
                .reduce((sum, row) => sum + row.amount, 0),
        };
    }, [filteredRows]);

    const columns: Column<PayableRow>[] = [
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
            render: (_, row: PayableRow) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
        },
        {
            key: 'supplier_name',
            header: 'Fornecedor',
        },
        {
            key: 'item',
            header: 'Descricao',
            render: (value: unknown, row: PayableRow) => {
                const fallback = row.purchase_id
                    ? `Compra #${row.purchase_id}`
                    : '-';

                return String(value || fallback);
            },
        },
        {
            key: 'installment_number',
            header: 'Parcela',
            render: (val: unknown, row: PayableRow) => {
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
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    return (
        <div className="space-y-4">
            <AccountsPayableHeader
                metrics={metrics}
                loading={isPayablesPending || isProcessingPayableAction}
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
                        {!isProcessingPayableAction && selectedAction === null && (
                            <p className="text-sm text-amber-600">
                                Selecione apenas títulos com o mesmo status para
                                aplicar a ação.
                            </p>
                        )}
                    </div>
                    {(selectedAction === 'pending' ||
                        selectedAction === 'partial' ||
                        batchAction === 'pending') && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (selectedPendingOrPartialRows.length !== 1) {
                                        toast.error(
                                            'Selecione exatamente 1 titulo para pagamento parcial.',
                                        );

                                        return;
                                    }

                                    setPartialAmountInput('');
                                    setIsPartialDialogOpen(true);
                                }}
                                disabled={
                                    isProcessingPayableAction ||
                                    selectedPendingOrPartialRows.length === 0
                                }
                            >
                                Pagar percentual
                            </Button>
                            <button
                            onClick={() => void handleConfirmPayment()}
                            disabled={isProcessingPayableAction}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessingPayableAction
                                ? 'Processando...'
                                : 'Marcar como Paga'}
                            </button>
                        </div>
                    )}
                    {(selectedAction === 'paid' || batchAction === 'paid') && (
                        <button
                            onClick={() => void handleUndoPayment()}
                            disabled={isProcessingPayableAction}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessingPayableAction
                                ? 'Processando...'
                                : 'Desfazer baixa'}
                        </button>
                    )}
                </div>
            )}
            <div className="flex justify-end">
                <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                        setStatusFilter(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <GenericTable
                data={rows}
                columns={columns}
                title="Contas a Pagar"
                loading={isPayablesPending}
                sortableColumns={[
                    { key: 'installment_number', type: 'number' },
                    { key: 'due_date', type: 'date' },
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
                    <AccountsPayableCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={(payload) => {
                            void createManualPayable
                                .mutateAsync(payload)
                                .then(() => {
                                    toast.success(
                                        'Conta a pagar criada com sucesso.',
                                    );
                                    onOpenChange(false);
                                })
                                .catch((error: unknown) => {
                                    const message =
                                        error instanceof Error && error.message
                                            ? error.message
                                            : 'Erro ao criar a conta a pagar.';
                                    toast.error(message);
                                });
                        }}
                        suppliers={dialogSupplierOptions}
                    />
                )}
                editDialog={({ open, onOpenChange, row }) => (
                    <AccountsPayableCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        mode="edit"
                        initialData={{
                            supplier_id: row.supplier_id ?? 0,
                            item: row.item ?? '',
                            description: row.description,
                            amount: row.amount,
                            entry_date: new Date().toISOString().slice(0, 10),
                            due_date: row.due_date,
                            payment_method:
                                row.paid_method === 'cash' ||
                                row.paid_method === 'pix' ||
                                row.paid_method === 'card' ||
                                row.paid_method === 'boleto'
                                    ? row.paid_method
                                    : 'pix',
                            status: row.status === 'paid' ? 'paid' : 'pending',
                            boleto_term_days: row.purchase_id ? 30 : 30,
                        }}
                        suppliers={dialogSupplierOptions}
                        onSubmit={async (payload) => {
                            await updateAccountPayable.mutateAsync({
                                id: Number(row.id),
                                data: payload,
                            });
                            toast.success(
                                'Conta a pagar atualizada com sucesso.',
                            );
                            onOpenChange(false);
                        }}
                    />
                )}
            />

            <Dialog
                open={isPartialDialogOpen}
                onOpenChange={setIsPartialDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Baixa parcial (Pagar)</DialogTitle>
                    </DialogHeader>
                    {selectedSingleRow ? (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <p className="text-muted-foreground">Fornecedor</p>
                                <p className="font-medium">{selectedSingleRow.supplier_name}</p>
                                <p className="text-muted-foreground">Produto</p>
                                <p className="font-medium">{selectedSingleRow.item ?? '-'}</p>
                                <p className="text-muted-foreground">Quantidade</p>
                                <p className="font-medium">
                                    {selectedSingleRow.item_quantity ?? '-'}
                                </p>
                                <p className="text-muted-foreground">Valor total</p>
                                <p className="font-medium">
                                    {formatCurrencyBR(selectedSingleRow.amount)}
                                </p>
                                <p className="text-muted-foreground">Saldo restante</p>
                                <p className="font-medium">
                                    {formatCurrencyBR(selectedSingleRow.remaining_balance)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payable-partial-amount">
                                    Valor pago agora
                                </Label>
                                <Input
                                    id="payable-partial-amount"
                                    value={partialAmountInput}
                                    onChange={(event) =>
                                        setPartialAmountInput(
                                            formatCurrencyInput(
                                                event.currentTarget.value,
                                            ),
                                        )
                                    }
                                    placeholder="R$ 0,00"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Selecione exatamente 1 titulo pendente/parcial.
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsPartialDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                if (!selectedSingleRow) {
                                    toast.error('Selecione exatamente 1 titulo.');

                                    return;
                                }

                                const amount = parseCurrencyInput(partialAmountInput);

                                if (amount <= 0) {
                                    toast.error('Informe um valor valido para pagar.');

                                    return;
                                }

                                if (amount > selectedSingleRow.remaining_balance) {
                                    toast.error('Valor acima do saldo restante da parcela.');

                                    return;
                                }

                                void partialSettleAccountPayable
                                    .mutateAsync({
                                        id: Number(selectedSingleRow.id),
                                        amount,
                                        paid_at: new Date().toISOString().slice(0, 10),
                                        paid_method: 'pix',
                                    })
                                    .then(() => {
                                        toast.success('Baixa parcial aplicada com sucesso.');
                                        setSelectedIds(new Set());
                                        setIsPartialDialogOpen(false);
                                    });
                            }}
                        >
                            Concluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
