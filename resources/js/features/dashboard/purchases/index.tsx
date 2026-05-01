import { mockPurchases } from '@/lib/mocks/mock-data';
import type { Purchase } from '@/lib/mocks/mock-data';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
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
import { PurchaseCreateDialog } from './purchase-create-dialog';

export function PurchasesModule() {
    const [purchases, setPurchases] = useState(() => [...mockPurchases]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-purchase') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/purchases');
        }
    }, []);

    const columns: Column<Purchase>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
        {
            key: 'total',
            header: 'Total',
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
        toast.success('Compra cadastrada com sucesso');
    };

    return (
        <GenericTable
            data={purchases}
            columns={columns}
            title="Compras"
            filterFields={filterFields}
            onCreate={handleCreate}
            isCreateOpen={isCreateOpen}
            onCreateOpenChange={setIsCreateOpen}
            createDialog={({ open, onOpenChange, onSubmit }) => (
                <PurchaseCreateDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    onSubmit={onSubmit}
                />
            )}
        />
    );
}
