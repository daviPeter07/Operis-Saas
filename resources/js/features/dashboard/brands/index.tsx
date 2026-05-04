import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { mockBrands } from '@/lib/mocks/mock-data';
import type { Brand } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function BrandsModule() {
    const [brands, setBrands] = useState(() => [...mockBrands]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('action') === 'create-brand') {
            setIsCreateOpen(true);
            window.history.replaceState({}, '', '/dashboard/brands');
        }
    }, []);

    const columns: Column<Brand>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'description', header: 'Descrição' },
    ];

    const handleCreate = (data: Brand) => {
        const newBrand: Brand = {
            id: crypto.randomUUID(),
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            createdAt: new Date().toISOString().slice(0, 10),
        };

        if (!newBrand.name) {
            throw new Error('Informe o nome da marca');
        }

        setBrands((previous) => [newBrand, ...previous]);
    };

    return (
        <GenericTable
            data={brands}
            columns={columns}
            title="Marcas"
            onCreate={handleCreate}
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
                    name: 'description',
                    label: 'Descrição',
                    type: 'text',
                    placeholder: 'Descrição opcional',
                },
            ]}
        />
    );
}
