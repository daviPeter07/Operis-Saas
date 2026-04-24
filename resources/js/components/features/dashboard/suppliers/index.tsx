import { GenericTable, type Column } from '../generic-table';
import { mockSuppliers, type Supplier } from '@/lib/mocks/mock-data';

export function SuppliersModule() {
    const columns: Column<Supplier>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'document', header: 'Documento' },
        { key: 'city', header: 'Cidade' },
        { key: 'state', header: 'Estado' },
    ];

    return (
        <GenericTable
            data={mockSuppliers}
            columns={columns}
            title="Fornecedores"
            onCreate={() => {}}
        />
    );
}
