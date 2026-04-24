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

    const filterFields = [
        { key: 'name', label: 'Nome', type: 'text' as const },
        { key: 'email', label: 'Email', type: 'text' as const },
        {
            key: 'city',
            label: 'Cidade',
            type: 'select' as const,
            options: [...new Set(mockSuppliers.map((s) => s.city))]
                .sort()
                .map((v) => ({ value: v, label: v })),
        },
        {
            key: 'state',
            label: 'Estado',
            type: 'select' as const,
            options: [...new Set(mockSuppliers.map((s) => s.state))]
                .sort()
                .map((v) => ({ value: v, label: v })),
        },
    ];

    return (
        <GenericTable
            data={mockSuppliers}
            columns={columns}
            title="Fornecedores"
            filterFields={filterFields}
            onCreate={() => {}}
        />
    );
}
