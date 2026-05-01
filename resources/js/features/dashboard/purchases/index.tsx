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
    translateStatus,
    translatePaymentMethod,
    formatQuantityWithUnit,
} from '@/lib/format';

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
            render: (val: unknown) => {
                const statusText = translateStatus(String(val));
                let bgColor = 'bg-gray-100 text-gray-800';
                if (val === 'pending')
                    bgColor = 'bg-yellow-100 text-yellow-800';
                if (val === 'completed')
                    bgColor = 'bg-green-100 text-green-800';
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
            ],
        },
    ];

    const handleCreate = (data: Purchase) => {
        const status = ['pending', 'completed', 'cancelled'].includes(
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
            createFields={[
                {
                    name: 'supplierName',
                    label: 'Fornecedor',
                    type: 'text',
                    required: true,
                    placeholder: 'Nome do fornecedor',
                },
                {
                    name: 'items',
                    label: 'Itens',
                    type: 'number',
                    required: true,
                    placeholder: 'Quantidade de itens',
                },
                {
                    name: 'total',
                    label: 'Total',
                    type: 'number',
                    required: true,
                    placeholder: 'Valor total da compra',
                },
                {
                    name: 'paymentMethod',
                    label: 'Método de Pagamento',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'money', label: 'Dinheiro' },
                        { value: 'credit', label: 'Crédito' },
                        { value: 'debit', label: 'Débito' },
                        { value: 'pix', label: 'PIX' },
                    ],
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'pending', label: 'Pendente' },
                        { value: 'completed', label: 'Concluído' },
                        { value: 'cancelled', label: 'Cancelado' },
                    ],
                },
                {
                    name: 'dueDate',
                    label: 'Vencimento',
                    type: 'date',
                    required: true,
                },
                {
                    name: 'createdAt',
                    label: 'Data',
                    type: 'date',
                    required: true,
                },
            ]}
        />
    );
}
