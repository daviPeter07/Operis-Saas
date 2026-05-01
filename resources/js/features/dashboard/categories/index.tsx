import { mockCategories } from '@/lib/mocks/mock-data';
import type { Category } from '@/lib/mocks/mock-data';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function CategoriesModule() {
    const [categories, setCategories] = useState(() => [...mockCategories]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'create-category') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/categories');
        }
    }, []);

    const columns: Column<Category>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'description', header: 'Descrição' },
    ];

    const handleCreate = (data: Category) => {
        const newCategory: Category = {
            id: crypto.randomUUID(),
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            parentId: null,
            createdAt: new Date().toISOString().slice(0, 10),
        };

        if (!newCategory.name) {
            toast.error('Informe o nome da categoria');
            return;
        }

        setCategories((previous) => [newCategory, ...previous]);
        toast.success('Categoria cadastrada com sucesso');
    };

    return (
        <GenericTable
            data={categories}
            columns={columns}
            title="Categorias"
            onCreate={handleCreate}
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
                    name: 'description',
                    label: 'Descrição',
                    type: 'text',
                    placeholder: 'Descrição opcional',
                },
            ]}
        />
    );
}
