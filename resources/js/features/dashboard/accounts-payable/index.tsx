import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useAccountPayables,
    useCreateManualAccountPayable,
    useSettleAccountPayable,
    useUpdateAccountPayable,
    useUnsettleAccountPayable,
} from '@/hooks/use-account-payables';
import { useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { UiSupplier } from '@/types/dashboard-entities';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { AccountsPayableCreateDialog } from './accounts-payable-create-dialog';

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
    due_date: string;
    status: string;
    paid_at: string | null;
    paid_method: string | null;
};

export function AccountsPayableModule() {
    const { data: payables = [], isPending: isPayablesPending } =
        useAccountPayables();
    const { data: suppliers = [] } = useSuppliers();
    const createManualPayable = useCreateManualAccountPayable();
    const updateAccountPayable = useUpdateAccountPayable();

    const settleAccountPayable = useSettleAccountPayable();
    const unsettleAccountPayable = useUnsettleAccountPayable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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

    const rows: PayableRow[] = payables.map((payable) => ({
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

    const handleConfirmPayment = async () => {
        const ids = rows
            .filter(
                (row) => selectedIds.has(row.id) && row.status === 'pending',
            )
            .map((row) => Number(row.id));

        if (ids.length === 0) {
            return;
        }

        await Promise.all(
            ids.map((id) =>
                settleAccountPayable.mutateAsync({
                    id,
                    paid_at: new Date().toISOString().slice(0, 10),
                    paid_method: 'pix',
                }),
            ),
        );
        toast.success(`${ids.length} conta(s) baixada(s) com sucesso.`);
        setSelectedIds(new Set());
    };

    const handleUndoPayment = async () => {
        const ids = rows
            .filter((row) => selectedIds.has(row.id) && row.status === 'paid')
            .map((row) => Number(row.id));

        if (ids.length === 0) {
            return;
        }

        await Promise.all(
            ids.map((id) => unsettleAccountPayable.mutateAsync(id)),
        );
        toast.success(`${ids.length} baixa(s) desfeita(s) com sucesso.`);
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const selectedRows = rows.filter((row) => selectedIds.has(row.id));
    const selectedStatuses = new Set(selectedRows.map((row) => row.status));
    const selectedAction =
        selectedRows.length > 0 && selectedStatuses.size === 1
            ? selectedRows[0].status
            : null;
    const totalValue = selectedRows.reduce((sum, row) => sum + row.amount, 0);

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
            {totalSelected > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                        <p className="font-medium">
                            {totalSelected} selecionada(s)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Total: {formatCurrencyBR(totalValue)}
                        </p>
                        {selectedAction === null && (
                            <p className="text-sm text-amber-600">
                                Selecione apenas títulos com o mesmo status para
                                aplicar a ação.
                            </p>
                        )}
                    </div>
                    {selectedAction === 'pending' && (
                        <button
                            onClick={() => void handleConfirmPayment()}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                        >
                            Marcar como Paga
                        </button>
                    )}
                    {selectedAction === 'paid' && (
                        <button
                            onClick={() => void handleUndoPayment()}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                        >
                            Desfazer baixa
                        </button>
                    )}
                </div>
            )}
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
        </div>
    );
}
