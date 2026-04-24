import { GenericTable, type Column } from '../generic-table';
import { mockSales, type Sale } from '@/lib/mocks/mock-data';

export function AccountsReceivableModule() {
    const pendingSales = mockSales.filter((s) => s.status === 'pending');

    const columns: Column<Sale>[] = [
        { key: 'clientName', header: 'Cliente' },
        {
            key: 'total',
            header: 'Valor',
            render: (val: unknown) => `R$ ${Number(val).toFixed(2)}`,
        },
        { key: 'paymentMethod', header: 'Método' },
        { key: 'createdAt', header: 'Data' },
    ];

    return <GenericTable data={pendingSales} columns={columns} />;
}
