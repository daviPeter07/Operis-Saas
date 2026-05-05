import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateCategory } from '@/hooks/use-update-category';
import { CategoryEditDialog } from './category-edit-dialog';
import {
    useCategories,
    useCreateCategory,
    useDeleteCategory,
} from '@/hooks/use-categories';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import { StatusBadge } from '@/components/common/status-badge';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export type CategoryRow = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
};

export function CategoriesModule() {
    const { data: categories = [] } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();
    const updateCategory = useUpdateCategory();
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('action') === 'create-category';
    });
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(
        null,
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-category') {
            window.history.replaceState({}, '', '/dashboard/categories');
        }
    }, []);

    const columns: Column<CategoryRow>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
    ];

    const handleCreate = async (data: CategoryRow) => {
        const name = String(data.name || '').trim();
        const status = data.status ?? 'active';

        if (!name) {
            throw new Error('Informe o nome da categoria');
        }

        await createCategory.mutateAsync({ name, status });
    };

    const rows: CategoryRow[] = categories.map((category) => ({
        id: String(category.id),
        name: category.name,
        status: category.status,
    }));

    return (
        <>
            <GenericTable
                data={rows}
                columns={columns}
                title="Categorias"
                onCreate={handleCreate}
                onEdit={(row) => {
                    setEditingCategory(row);
                    setIsEditOpen(true);
                }}
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
                    {
                        name: 'status',
                        label: 'Status',
                        type: 'select' as const,
                        required: true,
                        options: [...ENTITY_STATUS_OPTIONS],
                    },
                ]}
            />
            <CategoryEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                category={editingCategory}
                onSubmit={async ({ name, status }) => {
                    if (!editingCategory) return;
                    await updateCategory.mutateAsync({
                        id: Number(editingCategory.id),
                        name,
                        status,
                    });
                    toast.success('Categoria atualizada com sucesso.');
                }}
            />
        </>
    );
}
