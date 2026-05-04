import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { STATUS_OPTIONS } from '@/constants/status';
import { useCustomers } from '@/hooks/use-customers';
import { useSales } from '@/hooks/use-sales';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
} from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type ReceivableRow = {
    id: string;
    customer_id: number;
    clientName: string;
    total: number;
    status: string;
    payment_method: string;
    date: string;
};

export function AccountsReceivableModule() {
    const { data: sales = [] } = useSales();
    const { data: customers = [] } = useCustomers();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const customerById = new Map(
        customers.map((customer) => [customer.id, customer.name]),
    );

    const rows: ReceivableRow[] = sales.map((sale) => ({
        id: String(sale.id),
        customer_id: sale.customer_id,
        clientName: customerById.get(sale.customer_id) || `#${sale.customer_id}`,
        total: sale.total,
        status: sale.status,
        payment_method: sale.payment_method,
        date: sale.date,
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
        toast.info(
            `${selectedIds.size} conta(s) selecionada(s). A confirmação financeira será ligada no endpoint de baixa.`,
        );
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = rows
        .filter((row) => selectedIds.has(row.id))
        .reduce((sum, row) => sum + row.total, 0);

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
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Valor',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
        {
            key: 'payment_method',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'date',
            header: 'Data',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    const filterFields = [
        { key: 'clientName', label: 'Cliente', type: 'text' as const },
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [...STATUS_OPTIONS],
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
                        onClick={handleConfirmReceipt}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Recebida
                    </button>
                </div>
            )}
            <GenericTable
                data={rows}
                columns={columns}
                filterFields={filterFields}
                title="Contas a Receber"
                clickableRow
                onRowClick={(row) => handleSelectOne(row.id, !selectedIds.has(row.id))}
            />
        </div>
    );
}
