import { GenericTable, type Column } from '../generic-table';
import { mockProducts, type Product } from '@/lib/mocks/mock-data';

export function ProductsModule() {
    const columns: Column<Product>[] = [
        { key: 'name', header: 'Nome' },
        { key: 'sku', header: 'SKU' },
        { key: 'category', header: 'Categoria' },
        { key: 'brand', header: 'Marca' },
        {
            key: 'price',
            header: 'Preço',
            render: (val: unknown) => `R$ ${Number(val).toFixed(2)}`,
        },
        { key: 'stock', header: 'Estoque' },
    ];

    return (
        <GenericTable
            data={mockProducts}
            columns={columns}
            onCreate={() => {}}
        />
    );
}
