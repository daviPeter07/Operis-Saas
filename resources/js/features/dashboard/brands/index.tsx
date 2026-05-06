import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';
import { ENTITY_STATUS_OPTIONS } from '@/constants/entity-status';
import { useBrands, useCreateBrand, useDeleteBrand } from '@/hooks/use-brands';
import { useUpdateBrand } from '@/hooks/use-update-brand';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { BrandEditDialog } from './brand-edit-dialog';

export type BrandRow = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
};

export function BrandsModule() {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<BrandRow | null>(null);
    const { data: brands = [], isPending: isBrandsPending } = useBrands();
    const createBrand = useCreateBrand();
    const deleteBrand = useDeleteBrand();
    const updateBrand = useUpdateBrand();
    const [isCreateOpen, setIsCreateOpen] = useState(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('action') === 'create-brand';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-brand') {
            window.history.replaceState({}, '', '/dashboard/brands');
        }
    }, []);

    const columns: Column<BrandRow>[] = [
        { key: 'name', header: 'Nome' },
        {
            key: 'status',
            header: 'Status',
            render: (val: unknown) => <StatusBadge status={String(val)} />,
        },
    ];

    const handleCreate = async (data: BrandRow) => {
        const name = String(data.name || '').trim();
        const status = data.status ?? 'active';

        if (!name) {
            throw new Error('Informe o nome da marca');
        }

        await createBrand.mutateAsync({ name, status });
    };

    const rows: BrandRow[] = brands.map((brand) => ({
        id: String(brand.id),
        name: brand.name,
        status: brand.status,
    }));

    return (
        <>
            <GenericTable
                data={rows}
                columns={columns}
                title="Marcas"
                loading={isBrandsPending}
                sortableColumns={[{ key: 'name', type: 'text' }]}
                onCreate={handleCreate}
                onEdit={(row) => {
                    setEditingBrand(row);
                    setIsEditOpen(true);
                }}
                onDelete={async (row) => {
                    await deleteBrand.mutateAsync(Number(row.id));
                }}
                isCreateOpen={isCreateOpen}
                onCreateOpenChange={setIsCreateOpen}
                createFields={[
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
                        type: 'select' as const,
                        required: true,
                        options: [...ENTITY_STATUS_OPTIONS],
                    },
                ]}
            />
            <BrandEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                brand={editingBrand}
                onSubmit={async ({ name, status }) => {
                    if (!editingBrand) {
                        return;
                    }

                    await updateBrand.mutateAsync({
                        id: Number(editingBrand.id),
                        name,
                        status,
                    });
                    toast.success('Marca atualizada com sucesso.');
                }}
            />
        </>
    );
}
