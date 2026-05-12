import * as React from 'react';
import { CreateModal } from '@/components/table/create-modal';
import type { FormField } from '@/components/table/create-modal';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import type { CategoryRow } from '@/features/dashboard/categories/index';

type CategoryEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: CategoryRow | null;
    onSubmit: (data: {
        name: string;
        status: 'active' | 'inactive';
    }) => Promise<void>;
};

export function CategoryEditDialog({
    open,
    onOpenChange,
    category,
    onSubmit,
}: CategoryEditDialogProps) {
    const initialData = React.useMemo<Record<string, unknown>>(
        () => ({
            name: category?.name ?? '',
            status: category?.status ?? 'active',
        }),
        [category],
    );

    const fields = React.useMemo<FormField[]>(
        () => [
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
                type: 'select',
                required: true,
                options: [...ENTITY_STATUS_OPTIONS],
            },
        ],
        [],
    );

    const handleSave = async (data: Record<string, unknown>) => {
        if (!category) {
            return;
        }

        await onSubmit({
            name: String(data.name ?? '').trim(),
            status: String(data.status ?? 'active') as 'active' | 'inactive',
        });
    };

    return (
        <CreateModal
            open={open}
            onOpenChange={onOpenChange}
            title="Editar categoria"
            description="Atualize os dados da categoria."
            fields={fields}
            submitLabel="Salvar"
            onSubmit={handleSave}
            initialData={initialData}
        />
    );
}
