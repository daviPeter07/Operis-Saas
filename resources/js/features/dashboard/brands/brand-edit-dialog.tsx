import * as React from 'react';
import { CreateModal } from '@/components/table/create-modal';
import type { FormField } from '@/components/table/create-modal';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import type { BrandRow } from '@/features/dashboard/brands/index';

type BrandEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand: BrandRow | null;
    onSubmit: (data: {
        name: string;
        status: 'active' | 'inactive';
    }) => Promise<void>;
};

export function BrandEditDialog({
    open,
    onOpenChange,
    brand,
    onSubmit,
}: BrandEditDialogProps) {
    const initialData = React.useMemo<Record<string, unknown>>(
        () => ({
            name: brand?.name ?? '',
            status: brand?.status ?? 'active',
        }),
        [brand],
    );

    const fields = React.useMemo<FormField[]>(
        () => [
            {
                name: 'name',
                label: 'Nome',
                type: 'text',
                required: true,
                placeholder: 'Digite o nome da marca',
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
        if (!brand) {
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
            title="Editar marca"
            description="Atualize os dados da marca."
            fields={fields}
            submitLabel="Salvar"
            onSubmit={handleSave}
            initialData={initialData}
        />
    );
}
