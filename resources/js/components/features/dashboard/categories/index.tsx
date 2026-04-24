import { GenericTable, type Column } from '../generic-table';
import { mockCategories, type Category } from '@/lib/mocks/mock-data';

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
