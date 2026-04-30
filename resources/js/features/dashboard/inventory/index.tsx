import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { formatCurrencyBR, formatQuantityWithUnit } from '@/lib/format';
import { mockProducts } from '@/lib/mocks/mock-data';
import type { Product } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

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
        {
            key: 'barcode',
            header: 'Código de barras',
            render: (value: unknown) => String(value || 'Sem código'),
        },
        { key: 'brand', header: 'Marca' },
        { key: 'category', header: 'Categoria' },
        {
            key: 'price',
            header: 'Preço de venda',
            render: (value: unknown) => formatCurrencyBR(Number(value || 0)),
        },
        {
            key: 'stock',
            header: 'Estoque',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
        },
        {
            key: 'minStock',
            header: 'Estoque Mínimo',
            render: (value: unknown) => formatQuantityWithUnit(Number(value)),
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
            barcode: String(data.barcode || '').trim(),
            description: String(data.description || '').trim(),
            price: Number(data.price || 0),
            cost: Number(data.cost || 0),
            stock: Number(data.stock || 0),
            category: String(data.category || '').trim(),
            brand: String(data.brand || '').trim(),
            minStock: Number(data.minStock || 0),
            createdAt: new Date().toISOString().slice(0, 10),
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
                    section: 'Identificação',
                },
                {
                    name: 'sku',
                    label: 'Código interno',
                    type: 'text',
                    required: true,
                    placeholder: 'Clique em Gerar para preencher',
                    section: 'Identificação',
                },
                {
                    name: 'barcode',
                    label: 'Código de barras',
                    type: 'text',
                    placeholder: 'Escaneie com leitor ou gere EAN-13',
                    section: 'Identificação',
                },
                {
                    name: 'cost',
                    label: 'Preço de custo',
                    type: 'text',
                    required: true,
                    placeholder: 'R$ 0,00',
                    section: 'Valores e estoque',
                    mask: 'currency',
                },
                {
                    name: 'price',
                    label: 'Preço de venda',
                    type: 'text',
                    required: true,
                    placeholder: 'R$ 0,00',
                    section: 'Valores e estoque',
                    mask: 'currency',
                },
                {
                    name: 'stock',
                    label: 'Estoque inicial',
                    type: 'number',
                    required: true,
                    placeholder: 'Quantidade em estoque',
                    section: 'Valores e estoque',
                },
                {
                    name: 'minStock',
                    label: 'Estoque mínimo',
                    type: 'number',
                    required: true,
                    placeholder: 'Limite mínimo',
                    section: 'Valores e estoque',
                },
                {
                    name: 'brand',
                    label: 'Marca',
                    type: 'select',
                    required: true,
                    options: brandOptions,
                    placeholder: 'Digite ou selecione marca',
                    section: 'Classificação',
                    searchable: true,
                    allowCustomValue: true,
                },
                {
                    name: 'category',
                    label: 'Categoria',
                    type: 'select',
                    required: true,
                    options: categoryOptions,
                    placeholder: 'Digite ou selecione categoria',
                    section: 'Classificação',
                    searchable: true,
                    allowCustomValue: true,
                },
                {
                    name: 'description',
                    label: 'Descrição',
                    type: 'textarea',
                    placeholder: 'Adicione uma descrição opcional do produto',
                    section: 'Descrição',
                    span: 'full',
                },
            ]}
        />
    );
}
