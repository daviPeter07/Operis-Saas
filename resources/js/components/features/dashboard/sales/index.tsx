import {
    formatDateBR,
    formatCurrencyBR,
    translateStatus,
    translatePaymentMethod,
    formatQuantityWithUnit,
} from '@/lib/format';
import { mockSales } from '@/lib/mocks/mock-data';
import type { Sale } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function SalesModule() {
    const columns: Column<Sale>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => `R$ ${Number(val).toFixed(2)}`,
        },
        { key: 'status', header: 'Status' },
        { key: 'paymentMethod', header: 'Método' },
        { key: 'items', header: 'Itens' },
        { key: 'createdAt', header: 'Data' },
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
        <GenericTable
            data={mockSales}
            columns={columns}
            title="Vendas"
            filterFields={filterFields}
            onCreate={() => {}}
            createFields={[
                { name: 'clientName', label: 'Cliente', type: 'text', required: true, placeholder: 'Digite o nome do cliente' },
                { name: 'total', label: 'Total', type: 'number', required: true, placeholder: 'Digite o valor total' },
                { name: 'status', label: 'Status', type: 'select', required: true, options: [
                    { value: 'pending', label: 'Pendente' },
                    { value: 'completed', label: 'Concluído' },
                    { value: 'cancelled', label: 'Cancelado' },
                ]},
                { name: 'paymentMethod', label: 'Método de Pagamento', type: 'select', required: true, options: [
                    { value: 'money', label: 'Dinheiro' },
                    { value: 'credit', label: 'Crédito' },
                    { value: 'debit', label: 'Débito' },
                    { value: 'pix', label: 'PIX' },
                ]},
            ]}
        />
    );
}
