import type { Client, Product, Sale } from '@/lib/mocks/mock-data';
import type { QuickCreateField } from '@/types/quick-create';
import type { SalesLineItem } from '@/types/sales-dialog';

export const salesStatusOptions: Array<{
    value: Sale['status'];
    label: string;
}> = [
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' },
];

export const paymentMethodOptions: Array<{
    value: Sale['paymentMethod'];
    label: string;
}> = [
    { value: 'money', label: 'Dinheiro' },
    { value: 'credit', label: 'Crédito' },
    { value: 'debit', label: 'Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'installment', label: 'Parcelado' },
];

export function todayString(): string {
    return new Date().toISOString().slice(0, 10);
}

export function sortByName<T extends { name: string }>(items: T[]): T[] {
    return [...items].sort((first, second) =>
        first.name.localeCompare(second.name, 'pt-BR'),
    );
}

export function makeSaleLineItem(
    product: Product,
    quantity: number,
): SalesLineItem {
    return {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice: product.price,
        unitCost: product.cost,
        subtotal: Number((product.price * quantity).toFixed(2)),
    };
}

export function calculateCartTotal(items: SalesLineItem[]): number {
    return Number(
        items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );
}

export function calculateCartQuantity(items: SalesLineItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateProfit(items: SalesLineItem[], total: number): number {
    if (items.length === 0) {
        return Number((total * 0.32).toFixed(2));
    }

    return Number(
        items
            .reduce(
                (sum, item) =>
                    sum + (item.unitPrice - item.unitCost) * item.quantity,
                0,
            )
            .toFixed(2),
    );
}

export function buildClientFields(clients: Client[]): QuickCreateField[] {
    const cityOptions = Array.from(
        new Set(clients.map((client) => client.city)),
    )
        .sort((first, second) => first.localeCompare(second, 'pt-BR'))
        .map((value) => ({ value, label: value }));

    const stateOptions = Array.from(
        new Set(clients.map((client) => client.state)),
    )
        .sort((first, second) => first.localeCompare(second, 'pt-BR'))
        .map((value) => ({ value, label: value }));

    return [
        {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome completo',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'text',
            placeholder: 'cliente@empresa.com',
        },
        {
            name: 'phone',
            label: 'Telefone',
            type: 'text',
            placeholder: '(00) 00000-0000',
        },
        {
            name: 'document',
            label: 'Documento',
            type: 'text',
            placeholder: 'CPF/CNPJ',
        },
        { name: 'city', label: 'Cidade', type: 'select', options: cityOptions },
        {
            name: 'state',
            label: 'Estado',
            type: 'select',
            options: stateOptions,
        },
        {
            name: 'address',
            label: 'Endereço',
            type: 'text',
            placeholder: 'Rua, número e complemento',
        },
        {
            name: 'createdAt',
            label: 'Data de cadastro',
            type: 'date',
            required: true,
        },
    ];
}

export function buildProductFields(products: Product[]): QuickCreateField[] {
    const brandOptions = Array.from(
        new Set(products.map((product) => product.brand)),
    )
        .sort((first, second) => first.localeCompare(second, 'pt-BR'))
        .map((value) => ({ value, label: value }));

    const categoryOptions = Array.from(
        new Set(products.map((product) => product.category)),
    )
        .sort((first, second) => first.localeCompare(second, 'pt-BR'))
        .map((value) => ({ value, label: value }));

    return [
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
            placeholder: 'Código de identificação',
        },
        {
            name: 'barcode',
            label: 'Código de barras',
            type: 'text',
            placeholder: 'Escaneie ou digite o código',
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
    ];
}
