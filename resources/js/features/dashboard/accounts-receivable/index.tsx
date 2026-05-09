import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import {
    useAccountReceivables,
    useCreateManualAccountReceivable,
    useSettleAccountReceivable,
} from '@/hooks/use-account-receivables';
import { useCustomers } from '@/hooks/use-customers';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { AccountsReceivableCreateDialog } from './accounts-receivable-create-dialog';

type ReceivableRow = {
    id: string;
    customer_id: number | null;
    customer_name: string;
    sale_id: number | null;
    installment_number: number | null;
    item: string | null;
    description: string | null;
    amount: number;
    due_date: string | null;
    entry_date: string | null;
    date: string | null;
    status: string;
    received_at: string | null;
};

export function AccountsReceivableModule() {
    const { data: receivables = [], isPending: isReceivablesPending } =
        useAccountReceivables();
    const { data: customers = [], isPending: isCustomersPending } =
        useCustomers();
    const createManualReceivable = useCreateManualAccountReceivable();
    const settleAccountReceivable = useSettleAccountReceivable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const customerNameById = useMemo(
        () => new Map(customers.map((customer) => [customer.id, customer.name])),
        [customers],
    );

    const rows: ReceivableRow[] = receivables
        .filter((receivable) => receivable.status === 'pending')
        .map((receivable) => ({
            id: String(receivable.id),
            customer_id: receivable.customer_id,
            customer_name: receivable.customer_id
                ? (customerNameById.get(receivable.customer_id) ??
                  `#${receivable.customer_id}`)
                : 'Sem cliente',
            sale_id: receivable.sale_id,
            installment_number: receivable.installment_number,
            item: receivable.item,
            description: receivable.description,
            amount: receivable.amount,
            due_date: receivable.due_date,
            entry_date: receivable.entry_date,
            date: receivable.entry_date || receivable.due_date,
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

    const handleConfirmReceipt = async () => {
        const ids = Array.from(selectedIds).map((id) => Number(id));

        if (ids.length === 0) {
            return;
        }

        await Promise.all(
            ids.map((id) =>
                settleAccountReceivable.mutateAsync({
                    id,
                    received_at: new Date().toISOString().slice(0, 10),
                }),
            ),
        );

        toast.success(`${ids.length} conta(s) baixada(s) com sucesso.`);
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = rows
        .filter((row) => selectedIds.has(row.id))
        .reduce((sum, row) => sum + row.amount, 0);

    const columns: Column<ReceivableRow>[] = [
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
            render: (val: unknown, row: ReceivableRow) => {
                const item = String(val || '-');
                const installment = row.installment_number
                    ? ` (Parcela ${row.installment_number})`
                    : '';
                return `${item}${installment}`;
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
            key: 'date',
            header: 'Data',
            render: (value: unknown) =>
                value ? formatDateBR(String(value)) : '-',
        },
    ];

    return (
        <div className="space-y-4">
            {totalSelected > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                        <p className="font-medium">{totalSelected} selecionada(s)</p>
                        <p className="text-sm text-muted-foreground">
                            Total: {formatCurrencyBR(totalValue)}
                        </p>
                    </div>
                    <button
                        onClick={() => void handleConfirmReceipt()}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Recebida
                    </button>
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
                    { key: 'date', type: 'date' },
                ]}
                dateFilterKey="date"
                clickableRow
                onRowClick={(row) => handleSelectOne(row.id, !selectedIds.has(row.id))}
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
                            toast.success('Conta a receber criada com sucesso.');
                        }}
                    />
                )}
            />
        </div>
    );
}
