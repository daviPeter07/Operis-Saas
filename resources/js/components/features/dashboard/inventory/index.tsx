import { GenericTable, type Column } from '../generic-table';
import { mockProducts, type Product } from '@/lib/mocks/mock-data';

export function InventoryModule() {
    const columns: Column<Product>[] = [
        { key: 'name', header: 'Produto' },
        { key: 'sku', header: 'SKU' },
        { key: 'category', header: 'Categoria' },
        { key: 'brand', header: 'Marca' },
        { key: 'stock', header: 'Estoque' },
        { key: 'minStock', header: 'Estoque Mínimo' },
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
