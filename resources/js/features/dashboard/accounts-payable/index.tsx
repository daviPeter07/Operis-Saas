import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { mockPurchases } from '@/lib/mocks/mock-data';
import type { Purchase } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import {
    formatDateBR,
    formatCurrencyBR,
    translatePaymentMethod,
    formatQuantityWithUnit,
} from '@/lib/format';
import { PAYMENT_METHOD_OPTIONS } from '@/constants/payment-methods';
import { STATUS_OPTIONS, STATUS_VALUES } from '@/constants/status';
import { StatusBadge } from '@/components/common/status-badge';
import { AccountsPayableCreateDialog } from './accounts-payable-create-dialog';
import { toast } from 'sonner';

export function AccountsPayableModule() {
    const [purchases, setPurchases] = useState(() => [...mockPurchases]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-expense') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/accounts-payable');
        }
    }, []);

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleConfirmPayment = () => {
        setPurchases((prev) =>
            prev.map((p) =>
                selectedIds.has(p.id) ? { ...p, status: 'completed' } : p,
            ),
        );
        toast.success(`${selectedIds.size} conta(s) marcada(s) como paga(s)`);
        setSelectedIds(new Set());
    };

    const totalSelected = selectedIds.size;
    const totalValue = purchases
        .filter((p) => selectedIds.has(p.id))
        .reduce((sum, p) => sum + p.total, 0);

    const columns: Column<Purchase>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={
                        selectedIds.size === purchases.length &&
                        purchases.length > 0
                    }
                    ref={(el) => {
                        if (el) {
                            el.indeterminate =
                                selectedIds.size > 0 &&
                                selectedIds.size < purchases.length;
                        }
                    }}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(new Set(purchases.map((p) => p.id)));
                        } else {
                            setSelectedIds(new Set());
                        }
                    }}
                    className="h-4 w-4 cursor-pointer rounded border border-gray-400 accent-gray-600"
                />
            ),
            render: (_, row: Purchase) => (
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
            key: 'paymentMethod',
            header: 'Método',
            render: (val: unknown) => translatePaymentMethod(String(val)),
        },
        {
            key: 'items',
            header: 'Itens',
            render: (val: unknown) => formatQuantityWithUnit(Number(val)),
        },
        {
            key: 'createdAt',
            header: 'Data',
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
            key: 'paymentMethod',
            label: 'Método de Pagamento',
            type: 'select' as const,
            options: [...PAYMENT_METHOD_OPTIONS],
        },
    ];

    const handleCreate = (data: Purchase) => {
        const status = STATUS_VALUES.includes(
            String(data.status),
        )
            ? (String(data.status) as Purchase['status'])
            : 'pending';

        const paymentMethod = ['money', 'credit', 'debit', 'pix'].includes(
            String(data.paymentMethod),
        )
            ? (String(data.paymentMethod) as Purchase['paymentMethod'])
            : 'pix';

        const newPurchase: Purchase = {
            id: crypto.randomUUID(),
            supplierId: crypto.randomUUID(),
            supplierName: String(data.supplierName || '').trim(),
            total: Number(data.total || 0),
            status,
            paymentMethod,
            items: Number(data.items || 1),
            dueDate:
                String(data.dueDate || '').trim() ||
                new Date().toISOString().slice(0, 10),
            createdAt:
                String(data.createdAt || '').trim() ||
                new Date().toISOString().slice(0, 10),
        };

        if (!newPurchase.supplierName) {
            toast.error('Informe o fornecedor');
            return;
        }

        setPurchases((previous) => [newPurchase, ...previous]);
        toast.success('Despesa cadastrada com sucesso');
    };

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
                        onClick={handleConfirmPayment}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-gray-600 px-4 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-gray-700"
                    >
                        Marcar como Paga
                    </button>
                </div>
            )}
            <GenericTable
                data={purchases}
                columns={columns}
                filterFields={filterFields}
                title="Contas a Pagar"
                clickableRow
                onRowClick={(row) =>
                    handleSelectOne(row.id, !selectedIds.has(row.id))
                }
                onCreate={handleCreate}
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                createDialog={({ open, onOpenChange, onSubmit }) => (
                    <AccountsPayableCreateDialog
                        open={open}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                    />
                )}
            />
        </div>
    );
}
