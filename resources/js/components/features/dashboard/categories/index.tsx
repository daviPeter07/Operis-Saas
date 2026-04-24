import { mockCategories } from '@/lib/mocks/mock-data';
import type { Category } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function CategoriesModule() {
    const columns: Column<Category>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'description', header: 'Descrição' },
    ];

    return (
        <GenericTable
            data={mockCategories}
            columns={columns}
            title="Categorias"
            onCreate={() => {}}
        />
    );
}
