import { GenericTable, type Column } from '../generic-table';
import { mockPurchases, type Purchase } from '@/lib/mocks/mock-data';

export function AccountsPayableModule() {
    const pendingPurchases = mockPurchases.filter(
        (p) => p.status === 'pending',
    );

    const columns: Column<Purchase>[] = [
        { key: 'supplierName', header: 'Fornecedor' },
        {
            key: 'total',
            header: 'Valor',
            render: (val: unknown) => `R$ ${Number(val).toFixed(2)}`,
        },
        { key: 'items', header: 'Itens' },
        { key: 'createdAt', header: 'Data' },
    ];

    return (
        <GenericTable
            data={pendingPurchases}
            columns={columns}
            title="Contas a Pagar"
        />
    );
}
