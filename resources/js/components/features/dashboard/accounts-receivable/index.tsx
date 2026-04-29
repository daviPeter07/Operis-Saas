import { useState } from 'react';
import { mockSales } from '@/lib/mocks/mock-data';
import type { Sale } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
    translateStatus,
} from '@/lib/format';
import { toast } from 'sonner';

export function AccountsReceivableModule() {
    const [sales, setSales] = useState(() => [...mockSales]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleConfirmReceipt = () => {
        setSales((prev) =>
            prev.map((s) =>
                selectedIds.has(s.id) ? { ...s, status: 'completed' } : s,
            ),
        );
        toast.success(
            `${selectedIds.size} conta(s) marcada(s) como recebida(s)`,
        );
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = sales
        .filter((s) => selectedIds.has(s.id))
        .reduce((sum, s) => sum + s.total, 0);

    const columns: Column<Sale>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={
                        selectedIds.size === sales.length && sales.length > 0
                    }
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                selectedIds.size > 0 &&
                                selectedIds.size < sales.length;
                        }
                    }}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(new Set(sales.map((s) => s.id)));
                        } else {
                            setSelectedIds(new Set());
                        }
                    }}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
            render: (_, row: Sale) => (
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
            render: (val: unknown) => {
                const statusText = translateStatus(String(val));
                let bgColor = 'bg-gray-100 text-gray-800';
                if (val === 'pending') bgColor = 'bg-amber-100 text-amber-800';
                if (val === 'completed')
                    bgColor = 'bg-emerald-100 text-emerald-800';
                if (val === 'cancelled') bgColor = 'bg-red-100 text-red-800';
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}
                    >
                        {statusText}
                    </span>
                );
            },
        },
        {
            key: 'paymentMethod',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'createdAt',
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
            options: [
                { value: 'pending', label: 'Pendente' },
                { value: 'completed', label: 'Concluído' },
                { value: 'cancelled', label: 'Cancelado' },
            ],
        },
        {
            key: 'paymentMethod',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [
                { value: 'money', label: 'Dinheiro' },
                { value: 'credit', label: 'Crédito' },
                { value: 'debit', label: 'Débito' },
                { value: 'pix', label: 'PIX' },
                { value: 'installment', label: 'Parcelado' },
            ],
        },
    ];

    return (
        <div className="space-y-4">
            {totalSelected > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-lg font-medium text-gray-600">
                                {totalSelected}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium">
                                {totalSelected} conta(s) selecionada(s)
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total: {formatCurrencyBR(totalValue)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirmReceipt}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-gray-600 px-4 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Recebida
                    </button>
                </div>
            )}
            <GenericTable
                data={sales}
                columns={columns}
                filterFields={filterFields}
                title="Contas a Receber"
                clickableRow
                onRowClick={(row) =>
                    handleSelectOne(row.id, !selectedIds.has(row.id))
                }
            />
        </div>
    );
}
