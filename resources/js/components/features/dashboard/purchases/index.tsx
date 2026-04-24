import { GenericTable, type Column } from '../generic-table';
import { mockPurchases, type Purchase } from '@/lib/mocks/mock-data';

export function PurchasesModule() {
    const columns: Column<Purchase>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
        {
            key: 'total',
            header: 'Total',
            render: (val: unknown) => `R$ ${Number(val).toFixed(2)}`,
        },
        { key: 'status', header: 'Status' },
        { key: 'items', header: 'Itens' },
        { key: 'createdAt', header: 'Data' },
    ];

    return (
        <GenericTable
            data={mockPurchases}
            columns={columns}
            onCreate={() => {}}
        />
    );
}
