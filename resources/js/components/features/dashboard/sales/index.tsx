import {
    formatDateBR,
    formatCurrencyBR,
    translateStatus,
    translatePaymentMethod,
    formatQuantityWithUnit,
} from '@/lib/format';
import { mockSales } from '@/lib/mocks/mock-data';
import type { Sale } from '@/lib/mocks/mock-data';
import { useState } from 'react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function SalesModule() {
    const [sales, setSales] = useState(() => [...mockSales]);

    const columns: Column<Sale>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => formatCurrencyBR(Number(val)),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => translateStatus(String(val)),
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

    const handleCreate = (data: Sale) => {
        const status = ['pending', 'completed', 'cancelled'].includes(
            String(data.status),
        )
            ? (String(data.status) as Sale['status'])
            : 'pending';

        const paymentMethod = [
            'money',
            'credit',
            'debit',
            'pix',
            'installment',
        ].includes(String(data.paymentMethod))
            ? (String(data.paymentMethod) as Sale['paymentMethod'])
            : 'pix';

        const newSale: Sale = {
            id: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            clientName: String(data.clientName || ''),
            total: Number(data.total || 0),
            status,
            paymentMethod,
            items: Number(data.items || 1),
            createdAt:
                String(data.createdAt || '') ||
                new Date().toISOString().slice(0, 10),
        };

        setSales((previous) => [newSale, ...previous]);
        toast.success('Venda cadastrada com sucesso');
    };

    return (
        <GenericTable
            data={sales}
            columns={columns}
            title="Vendas"
            filterFields={filterFields}
            onCreate={handleCreate}
            createFields={[
                {
                    name: 'clientName',
                    label: 'Cliente',
                    type: 'text',
                    required: true,
                    placeholder: 'Nome do cliente',
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
                    placeholder: 'Valor total da venda',
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
                        { value: 'installment', label: 'Parcelado' },
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
                    name: 'createdAt',
                    label: 'Data',
                    type: 'date',
                    required: true,
                },
            ]}
        />
    );
}
