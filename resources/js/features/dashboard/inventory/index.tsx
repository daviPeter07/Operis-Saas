import { useMemo } from 'react';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { useCreateProduct, useProducts } from '@/hooks/use-products';
import { formatCurrencyBR, formatQuantityWithUnit } from '@/lib/format';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

type ProductRow = {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    sale_price: number;
    stock: number;
    min_stock: number;
    category_id: number;
    brand_id: number | null;
    status: 'active' | 'inactive';
};

export function InventoryModule() {
    const { data: products = [] } = useProducts();
    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();
    const createProduct = useCreateProduct();

    const rows: ProductRow[] = products.map((product) => ({
        id: String(product.id),
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        sale_price: product.sale_price,
        stock: product.stock,
        min_stock: product.min_stock,
        category_id: product.category_id,
        brand_id: product.brand_id,
        status: product.status,
    }));

    const categoryNameById = useMemo(
        () =>
            new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );

    const brandNameById = useMemo(
        () => new Map(brands.map((brand) => [brand.id, brand.name])),
        [brands],
    );

    const columns: Column<ProductRow>[] = [
        { key: 'name', header: 'Produto' },
        { key: 'sku', header: 'Código' },
        {
            key: 'barcode',
            header: 'Código de barras',
            render: (value: unknown) => String(value || 'Sem código'),
        },
        {
            key: 'brand_id',
            header: 'Marca',
            render: (value: unknown) =>
                brandNameById.get(Number(value)) || 'Sem marca',
        },
        {
            key: 'category_id',
            header: 'Categoria',
            render: (value: unknown) =>
                categoryNameById.get(Number(value)) || '-',
        },
        {
            key: 'sale_price',
            header: 'Preço de venda',
            render: (value: unknown) => formatCurrencyBR(Number(value || 0)),
        },
        {
            key: 'stock',
            header: 'Estoque',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
        },
        {
            key: 'min_stock',
            header: 'Estoque Mínimo',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
        },
    ];

    const filterFields = [
        { key: 'name', label: 'Produto', type: 'text' as const },
        {
            key: 'category_id',
            label: 'Categoria',
            type: 'select' as const,
            options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        },
        {
            key: 'brand_id',
            label: 'Marca',
            type: 'select' as const,
            options: brands.map((brand) => ({
                value: String(brand.id),
                label: brand.name,
            })),
        },
    ];

    const handleCreate = async (data: Record<string, unknown>) => {
        const name = String(data.name || '').trim();
        const sku = String(data.sku || '').trim();
        const categoryId = Number(data.category_id || 0);

        if (!name) {
            throw new Error('Informe o nome do produto');
        }

        if (!sku) {
            throw new Error('Informe o código do produto');
        }

        if (!categoryId) {
            throw new Error('Selecione uma categoria');
        }

        await createProduct.mutateAsync({
            name,
            sku,
            barcode: String(data.barcode || '').trim() || null,
            description: String(data.description || '').trim() || null,
            sale_price: Number(data.sale_price || 0),
            cost: Number(data.cost || 0),
            stock: Number(data.stock || 0),
            min_stock: Number(data.min_stock || 0),
            category_id: categoryId,
            brand_id: data.brand_id ? Number(data.brand_id) : null,
        });
    };

    return (
        <GenericTable
            data={rows}
            columns={columns}
            title="Estoque"
            filterFields={filterFields}
            onCreate={handleCreate as (data: ProductRow) => Promise<void>}
            createFields={[
                {
                    name: 'name',
                    label: 'Nome do produto',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'sku',
                    label: 'Código interno',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'barcode',
                    label: 'Código de barras',
                    type: 'text',
                },
                {
                    name: 'cost',
                    label: 'Preço de custo',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'sale_price',
                    label: 'Preço de venda',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'stock',
                    label: 'Estoque inicial',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'min_stock',
                    label: 'Estoque mínimo',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'brand_id',
                    label: 'Marca',
                    type: 'select',
                    options: brands.map((brand) => ({
                        value: String(brand.id),
                        label: brand.name,
                    })),
                },
                {
                    name: 'category_id',
                    label: 'Categoria',
                    type: 'select',
                    required: true,
                    options: categories.map((category) => ({
                        value: String(category.id),
                        label: category.name,
                    })),
                },
                {
                    name: 'description',
                    label: 'Descrição',
                    type: 'textarea',
                },
            ]}
        />
    );
}
