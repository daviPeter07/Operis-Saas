import { useEffect, useState } from 'react';
import { useBrands, useCreateBrand, useDeleteBrand } from '@/hooks/use-brands';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type BrandRow = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
};

export function BrandsModule() {
    const { data: brands = [] } = useBrands();
    const createBrand = useCreateBrand();
    const deleteBrand = useDeleteBrand();
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
        { key: 'status', header: 'Status' },
    ];

    const handleCreate = async (data: BrandRow) => {
        const name = String(data.name || '').trim();

        if (!name) {
            throw new Error('Informe o nome da marca');
        }

        await createBrand.mutateAsync({ name });
    };

    const rows: BrandRow[] = brands
        .filter((brand) => brand.status === 'active')
        .map((brand) => ({
            id: String(brand.id),
            name: brand.name,
            status: brand.status,
        }));

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Marcas"
            onCreate={handleCreate}
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
            ]}
        />
    );
}
