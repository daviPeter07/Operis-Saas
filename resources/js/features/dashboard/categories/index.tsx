import { useEffect, useState } from 'react';
import {
    useCategories,
    useCreateCategory,
    useDeleteCategory,
} from '@/hooks/use-categories';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type CategoryRow = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
};

export function CategoriesModule() {
    const { data: categories = [] } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('action') === 'create-category';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-category') {
            window.history.replaceState({}, '', '/dashboard/categories');
        }
    }, []);

    const columns: Column<CategoryRow>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'status', header: 'Status' },
    ];

    const handleCreate = async (data: CategoryRow) => {
        const name = String(data.name || '').trim();

        if (!name) {
            throw new Error('Informe o nome da categoria');
        }

        await createCategory.mutateAsync({ name });
    };

    const rows: CategoryRow[] = categories
        .filter((category) => category.status === 'active')
        .map((category) => ({
            id: String(category.id),
            name: category.name,
            status: category.status,
        }));

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Categorias"
            onCreate={handleCreate}
            onDelete={async (row) => {
                await deleteCategory.mutateAsync(Number(row.id));
            }}
            isCreateOpen={isCreateOpen}
            onCreateOpenChange={setIsCreateOpen}
            createFields={[
                {
                    name: 'name',
                    label: 'Nome',
                    type: 'text',
                    required: true,
                    placeholder: 'Digite o nome da categoria',
                },
            ]}
        />
    );
}
