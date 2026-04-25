import { mockProducts } from '@/lib/mocks/mock-data';
import type { Product } from '@/lib/mocks/mock-data';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';
import { formatQuantityWithUnit } from '@/lib/format';

export function InventoryModule() {
    const [products, setProducts] = useState(() => [...mockProducts]);

    const brandOptions = useMemo(
        () =>
            Array.from(new Set(products.map((product) => product.brand)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [products],
    );

    const categoryOptions = useMemo(
        () =>
            Array.from(new Set(products.map((product) => product.category)))
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [products],
    );

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

    const filterFields = [
        { key: 'name', label: 'Produto', type: 'text' as const },
        {
            key: 'category',
            label: 'Categoria',
            type: 'select' as const,
            options: categoryOptions,
        },
        {
            key: 'brand',
            label: 'Marca',
            type: 'select' as const,
            options: brandOptions,
        },
    ];

    const handleCreate = (data: Product) => {
        const newProduct: Product = {
            id: crypto.randomUUID(),
            name: String(data.name || '').trim(),
            sku: String(data.sku || '').trim(),
            price: Number(data.price || 0),
            cost: Number(data.cost || 0),
            stock: Number(data.stock || 0),
            category: String(data.category || '').trim(),
            brand: String(data.brand || '').trim(),
            minStock: Number(data.minStock || 0),
            createdAt:
                String(data.createdAt || '').trim() ||
                new Date().toISOString().slice(0, 10),
        };

        if (!newProduct.name) {
            toast.error('Informe o nome do produto');
            return;
        }

        if (!newProduct.sku) {
            toast.error('Informe ou gere um código para o produto');
            return;
        }

        setProducts((previous) => [newProduct, ...previous]);
        toast.success('Produto cadastrado com sucesso');
    };

    return (
        <GenericTable
            data={products}
            columns={columns}
            title="Estoque"
            filterFields={filterFields}
            onCreate={handleCreate}
            createFields={[
                {
                    name: 'name',
                    label: 'Nome do produto',
                    type: 'text',
                    required: true,
                    placeholder: 'Digite o nome do produto',
                },
                {
                    name: 'sku',
                    label: 'Código interno',
                    type: 'text',
                    required: true,
                    placeholder: 'Clique em Gerar para preencher',
                },
                {
                    name: 'barcode',
                    label: 'Código de barras',
                    type: 'text',
                    placeholder: 'Escaneie com leitor ou gere EAN-13',
                },
                {
                    name: 'brand',
                    label: 'Marca',
                    type: 'select',
                    required: true,
                    options: brandOptions,
                },
                {
                    name: 'category',
                    label: 'Categoria',
                    type: 'select',
                    required: true,
                    options: categoryOptions,
                },
                {
                    name: 'cost',
                    label: 'Custo',
                    type: 'number',
                    required: true,
                    placeholder: 'Custo de aquisição',
                },
                {
                    name: 'price',
                    label: 'Preço de venda',
                    type: 'number',
                    required: true,
                    placeholder: 'Preço final',
                },
                {
                    name: 'stock',
                    label: 'Estoque inicial',
                    type: 'number',
                    required: true,
                    placeholder: 'Quantidade em estoque',
                },
                {
                    name: 'minStock',
                    label: 'Estoque mínimo',
                    type: 'number',
                    required: true,
                    placeholder: 'Limite mínimo',
                },
                {
                    name: 'createdAt',
                    label: 'Data de cadastro',
                    type: 'date',
                    required: true,
                },
            ]}
        />
    );
}
