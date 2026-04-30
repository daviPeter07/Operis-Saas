import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreateModal } from '@/components/table/create-modal';
import type { FormField } from '@/components/table/create-modal';
import { formatCurrencyBR, formatQuantityWithUnit } from '@/lib/format';
import { mockProducts } from '@/lib/mocks/mock-data';
import type { Product } from '@/lib/mocks/mock-data';
import { GenericTable } from '../generic-table';
import type { Column } from '../generic-table';

export function InventoryModule() {
    const [products, setProducts] = useState(() => [...mockProducts]);
    const [customBrands, setCustomBrands] = useState<string[]>([]);
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [isBrandCreateOpen, setIsBrandCreateOpen] = useState(false);
    const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);

    const brandOptions = useMemo(
        () =>
            Array.from(
                new Set([
                    ...products.map((product) => product.brand),
                    ...customBrands,
                ]),
            )
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [customBrands, products],
    );

    const categoryOptions = useMemo(
        () =>
            Array.from(
                new Set([
                    ...products.map((product) => product.category),
                    ...customCategories,
                ]),
            )
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .map((value) => ({ value, label: value })),
        [customCategories, products],
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

    const createFields = useMemo<FormField[]>(
        () => [
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
                placeholder: 'Gerar código interno',
                section: 'Identificação',
            },
            {
                name: 'barcode',
                label: 'Código de barras',
                type: 'text',
                placeholder: 'Escaneie ou gere EAN-13',
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
                actionButton: {
                    label: 'Criar',
                    onClick: () => setIsBrandCreateOpen(true),
                },
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
                actionButton: {
                    label: 'Criar',
                    onClick: () => setIsCategoryCreateOpen(true),
                },
            },
            {
                name: 'description',
                label: 'Descrição',
                type: 'textarea',
                placeholder: 'Adicione uma descrição opcional do produto',
                section: 'Descrição',
                span: 'full',
            },
        ],
        [brandOptions, categoryOptions],
    );

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
        <>
            <GenericTable
                data={products}
                columns={columns}
                title="Estoque"
                filterFields={filterFields}
                onCreate={handleCreate}
                createDialog={({ open, onOpenChange, onSubmit, title }) => (
                    <CreateModal<Record<string, unknown>>
                        open={open}
                        onOpenChange={onOpenChange}
                        title={title}
                        description="Preencha os dados abaixo para criar um novo registro."
                        fields={createFields}
                        onSubmit={(data) =>
                            onSubmit(data as unknown as Product)
                        }
                    />
                )}
            />

            <CreateModal<Record<string, unknown>>
                open={isBrandCreateOpen}
                onOpenChange={setIsBrandCreateOpen}
                title="Criar Nova Marca"
                description="Preencha os dados abaixo para criar um novo registro."
                fields={[
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
                onSubmit={(data) => {
                    const brand = String(data.name || '').trim();

                    if (!brand) {
                        throw new Error('Nome de marca inválido');
                    }

                    setCustomBrands((previous) =>
                        previous.includes(brand)
                            ? previous
                            : [...previous, brand],
                    );
                    toast.success('Marca criada com sucesso');

                    return brand;
                }}
            />

            <CreateModal<Record<string, unknown>>
                open={isCategoryCreateOpen}
                onOpenChange={setIsCategoryCreateOpen}
                title="Criar Nova Categoria"
                description="Preencha os dados abaixo para criar um novo registro."
                fields={[
                    {
                        name: 'name',
                        label: 'Nome',
                        type: 'text',
                        required: true,
                        placeholder: 'Digite o nome da categoria',
                    },
                    {
                        name: 'description',
                        label: 'Descrição',
                        type: 'text',
                        placeholder: 'Descrição opcional',
                    },
                ]}
                onSubmit={(data) => {
                    const category = String(data.name || '').trim();

                    if (!category) {
                        throw new Error('Nome de categoria inválido');
                    }

                    setCustomCategories((previous) =>
                        previous.includes(category)
                            ? previous
                            : [...previous, category],
                    );
                    toast.success('Categoria criada com sucesso');

                    return category;
                }}
            />
        </>
    );
}
