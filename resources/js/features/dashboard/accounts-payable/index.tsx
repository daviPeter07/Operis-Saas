import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS } from '@/constants/status';
import { usePurchases } from '@/hooks/use-purchases';
import { useSuppliers } from '@/hooks/use-suppliers';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
} from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type PayableRow = {
    id: string;
    supplier_id: number;
    supplierName: string;
    total: number;
    status: string;
    payment_method: string;
    due_date: string;
    date: string;
};

export function AccountsPayableModule() {
    const { data: purchases = [] } = usePurchases();
    const { data: suppliers = [] } = useSuppliers();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const suppliersById = new Map(
        suppliers.map((supplier) => [supplier.id, supplier.name]),
    );

    const rows: PayableRow[] = purchases.map((purchase) => ({
        id: String(purchase.id),
        supplier_id: purchase.supplier_id,
        supplierName:
            suppliersById.get(purchase.supplier_id) || `#${purchase.supplier_id}`,
        total: purchase.total,
        status: purchase.status,
        payment_method: purchase.payment_method,
        due_date: purchase.due_date,
        date: purchase.date,
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
        toast.info(
            `${selectedIds.size} conta(s) selecionada(s). A confirmação financeira será ligada no endpoint de baixa.`,
        );
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = rows
        .filter((row) => selectedIds.has(row.id))
        .reduce((sum, row) => sum + row.total, 0);

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
        { key: 'supplierName', header: 'Fornecedor' },
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
        {
            key: 'due_date',
            header: 'Vencimento',
            render: (val: unknown) => formatDateBR(String(val)),
        },
    ];

    const filterFields = [
        { key: 'supplierName', label: 'Fornecedor', type: 'text' as const },
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [...STATUS_OPTIONS],
        },
        {
            key: 'payment_method',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [...PAYMENT_METHOD_OPTIONS],
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
                        onClick={handleConfirmPayment}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Paga
                    </button>
                </div>
            )}
            <GenericTable
                data={rows}
                columns={columns}
                filterFields={filterFields}
                title="Contas a Pagar"
                clickableRow
                onRowClick={(row) => handleSelectOne(row.id, !selectedIds.has(row.id))}
            />
        </div>
    );
}
