import { GenericTable, type Column } from '../generic-table';
import { mockBrands, type Brand } from '@/lib/mocks/mock-data';

export function BrandsModule() {
    const columns: Column<Brand>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'description', header: 'Descrição' },
    ];

    return (
        <GenericTable
            data={mockBrands}
            columns={columns}
            title="Marcas"
            onCreate={() => {}}
        />
    );
}
