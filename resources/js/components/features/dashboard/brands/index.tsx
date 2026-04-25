import { mockBrands } from '@/lib/mocks/mock-data';
import type { Brand } from '@/lib/mocks/mock-data';
import { useState } from 'react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function BrandsModule() {
    const [brands, setBrands] = useState(() => [...mockBrands]);

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
            toast.error('Informe o nome da marca');
            return;
        }

        setBrands((previous) => [newBrand, ...previous]);
        toast.success('Marca cadastrada com sucesso');
    };

    return (
        <GenericTable
            data={brands}
            columns={columns}
            title="Marcas"
            onCreate={handleCreate}
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
