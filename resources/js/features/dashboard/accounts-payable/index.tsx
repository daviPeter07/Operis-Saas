import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { STATUS_OPTIONS } from '@/constants/status';
import {
    useAccountPayables,
    useSettleAccountPayable,
} from '@/hooks/use-account-payables';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type PayableRow = {
    id: string;
    purchase_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
    paid_at: string | null;
    paid_method: string | null;
};

export function AccountsPayableModule() {
    const { data: payables = [] } = useAccountPayables();
    const settleAccountPayable = useSettleAccountPayable();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const rows: PayableRow[] = payables.map((payable) => ({
        id: String(payable.id),
        purchase_id: payable.purchase_id,
        installment_number: payable.installment_number,
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
            key: 'purchase_id',
            header: 'Compra',
            render: (val: unknown) => `#${String(val)}`,
        },
        { key: 'installment_number', header: 'Parcela' },
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

    const filterFields = [
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
                filterFields={filterFields}
                title="Contas a Pagar"
                clickableRow
                onRowClick={(row) => handleSelectOne(row.id, !selectedIds.has(row.id))}
            />
        </div>
    );
}
