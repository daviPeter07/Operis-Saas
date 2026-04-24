import { mockBrands } from '@/lib/mocks/mock-data';
import type { Brand } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

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
