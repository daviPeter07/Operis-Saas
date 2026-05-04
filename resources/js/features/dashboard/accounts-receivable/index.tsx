import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { STATUS_OPTIONS } from '@/constants/status';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type ReceivableRow = {
    id: string;
    sale_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
    received_at: string | null;
};

export function AccountsReceivableModule() {
    const { data: receivables = [] } = useAccountReceivables();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const rows: ReceivableRow[] = receivables.map((receivable) => ({
        id: String(receivable.id),
        sale_id: receivable.sale_id,
        installment_number: receivable.installment_number,
        amount: receivable.amount,
        due_date: receivable.due_date,
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
        toast.info(
            'Recebimento em lote não disponível no backend atual (apenas listagem de contas a receber).',
        );
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
            key: 'sale_id',
            header: 'Venda',
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
