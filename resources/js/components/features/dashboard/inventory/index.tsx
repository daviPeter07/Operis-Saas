import { mockProducts } from '@/lib/mocks/mock-data';
import type { Product } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { formatQuantityWithUnit } from '@/lib/format';

export function InventoryModule() {
    const columns: Column<Product>[] = [
        { key: 'name', header: 'Produto' },
        { key: 'sku', header: 'Código' },
        { key: 'category', header: 'Categoria' },
        { key: 'brand', header: 'Marca' },
        {
            key: 'stock',
            header: 'Estoque',
            render: (val: unknown) => formatQuantityWithUnit(Number(val)),
        },
        {
            key: 'minStock',
            header: 'Estoque Mínimo',
            render: (val: unknown) => formatQuantityWithUnit(Number(val)),
        },
    ];

    return (
        <GenericTable
            data={mockProducts}
            columns={columns}
            title="Estoque"
            onCreate={() => {}}
        />
    );
}
