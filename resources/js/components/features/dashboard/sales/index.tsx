import { GenericTable, type Column } from '../generic-table';
import { mockSales, type Sale } from '@/lib/mocks/mock-data';

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

    return (
        <GenericTable
            data={mockSales}
            columns={columns}
            title="Vendas"
            onCreate={() => {}}
        />
    );
}
