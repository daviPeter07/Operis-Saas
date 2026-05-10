import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useAccountPayables,
    useCreateManualAccountPayable,
    useDeleteAccountPayable,
    useSettleAccountPayable,
} from '@/hooks/use-account-payables';
import { useCreateSupplier, useSuppliers } from '@/hooks/use-suppliers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { UiSupplier } from '@/types/dashboard-entities';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { AccountsPayableCreateDialog } from './accounts-payable-create-dialog';

type PayableRow = {
    id: string;
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
    const createSupplier = useCreateSupplier();
    const createManualPayable = useCreateManualAccountPayable();

    const settleAccountPayable = useSettleAccountPayable();
    const deleteAccountPayable = useDeleteAccountPayable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [dialogSuppliers, setDialogSuppliers] = useState<UiSupplier[]>([]);

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

    const dialogSupplierOptions = useMemo(
        () => [...dialogSuppliers, ...mappedSuppliers],
        [dialogSuppliers, mappedSuppliers],
    );

    const supplierNameById = useMemo(
        () => new Map(suppliers.map((supplier) => [supplier.id, supplier.name])),
        [suppliers],
    );

    const rows: PayableRow[] = payables
        .filter((payable) => payable.status === 'pending')
        .map((payable) => ({
            id: String(payable.id),
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
        const ids = Array.from(selectedIds).map((id) => Number(id));

        if (ids.length === 0) {
return;
}

        await Promise.all(
            ids.map((id) =>
                settleAccountPayable.mutateAsync({
                    id,
                    paid_at: new Date().toISOString().slice(0, 10),
                    paid_method: 'pix',
                })
            ),
        );
        toast.success(`${ids.length} conta(s) baixada(s) com sucesso.`);
        setSelectedIds(new Set());
    };


    const totalSelected = selectedIds.size;
    const totalValue = rows
        .filter((row) => selectedIds.has(row.id))
        .reduce((sum, row) => sum + row.amount, 0);

    const handleCreateSupplier = async (
        supplier: UiSupplier,
    ): Promise<UiSupplier> => {
        const createdSupplier = await createSupplier.mutateAsync({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            document: supplier.document,
        });

        const mappedSupplier: UiSupplier = {
            id: String(createdSupplier.id),
            name: createdSupplier.name,
            email: createdSupplier.email ?? '',
            phone: createdSupplier.phone ?? '',
            document: createdSupplier.document ?? '',
            city: '',
            state: '',
            address: '',
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setDialogSuppliers((previous) => [mappedSupplier, ...previous]);

        return mappedSupplier;
    };

    const columns: Column<PayableRow>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={selectedIds.size === rows.length && rows.length > 0}
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
                    </div>
                    <button
                        onClick={() => void handleConfirmPayment()}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Paga
                    </button>
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
                onDelete={async (row) => {
                    if (row.purchase_id) {
                        // Impedir exclusão de contas vinculadas a compra
                        throw new Error('Não é permitido excluir contas geradas a partir de uma compra.');
                    }

                    await deleteAccountPayable.mutateAsync(Number(row.id));
                    setSelectedIds(new Set());
                }}
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
                        onCreateSupplier={handleCreateSupplier}
                    />
                )}
            />
        </div>
    );
}
