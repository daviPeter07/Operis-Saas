import type {
    UiCustomer,
    UiProduct,
    UiSale,
} from '@/types/dashboard-entities';
import type { QuickCreateField } from '@/types/quick-create';
import type { SaleDiscountType, SalesLineItem } from '@/types/sales-dialog';

export const salesStatusOptions: Array<{
    value: UiSale['status'];
    label: string;
}> = [
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluido' },
    { value: 'cancelled', label: 'Cancelado' },
];

export const paymentMethodOptions: Array<{
    value: UiSale['paymentMethod'];
    label: string;
}> = [
    { value: 'money', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'card', label: 'Cartao' },
    { value: 'other', label: 'Outros' },
];

export function todayString(daysAgo = 0): string {
    const brazilNow = new Date(
        new Date().toLocaleString('en-US', {
            timeZone: 'America/Sao_Paulo',
        }),
    );

    brazilNow.setHours(0, 0, 0, 0);
    brazilNow.setDate(brazilNow.getDate() - daysAgo);

    const year = brazilNow.getFullYear();
    const month = String(brazilNow.getMonth() + 1).padStart(2, '0');
    const day = String(brazilNow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function makeSaleLineItem(
    product: UiProduct,
    quantity: number,
    salePrice?: number,
): SalesLineItem {
    const unitPrice = salePrice ?? product.price;

    return {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        unitCost: product.cost,
        subtotal: Number((unitPrice * quantity).toFixed(2)),
    };
}

export function filterProductsByQuery(
    products: UiProduct[],
    query: string,
): UiProduct[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return products;
    }

    return products.filter((product) => {
        return (
            product.name.toLowerCase().includes(normalizedQuery) ||
            product.sku.toLowerCase().includes(normalizedQuery)
        );
    });
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

export function calculateDiscountAmount(
    subtotal: number,
    discountType: SaleDiscountType,
    discountValue: number,
): number {
    if (subtotal <= 0 || discountValue <= 0) {
        return 0;
    }

    if (discountType === 'percent') {
        const cappedPercent = Math.min(100, discountValue);

        return Number(((subtotal * cappedPercent) / 100).toFixed(2));
    }

    return Number(Math.min(subtotal, discountValue).toFixed(2));
}

export function calculateFinalTotal(
    subtotal: number,
    discountAmountApplied: number,
): number {
    return Number(Math.max(0, subtotal - discountAmountApplied).toFixed(2));
}

export function buildClientFields(clients: UiCustomer[]): QuickCreateField[] {
    const cityOptions = Array.from(
        new Set(clients.map((client) => client.city)),
    ).map((value) => ({ value, label: value }));

    const stateOptions = Array.from(
        new Set(clients.map((client) => client.state)),
    ).map((value) => ({ value, label: value }));

    return [
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'phone', label: 'Telefone', type: 'text', mask: 'phone' },
        { name: 'document', label: 'Documento', type: 'text', mask: 'document' },
        { name: 'city', label: 'Cidade', type: 'select', options: cityOptions },
        { name: 'state', label: 'Estado', type: 'select', options: stateOptions },
        { name: 'address', label: 'Endereco', type: 'text' },
        { name: 'createdAt', label: 'Data de cadastro', type: 'date', required: true },
    ];
}

export function buildProductFields(products: UiProduct[]): QuickCreateField[] {
    const brandOptions = Array.from(
        new Set(products.map((product) => product.brand)),
    ).map((value) => ({ value, label: value }));

    const categoryOptions = Array.from(
        new Set(products.map((product) => product.category)),
    ).map((value) => ({ value, label: value }));

    return [
        { name: 'name', label: 'Nome do produto', type: 'text', required: true },
        { name: 'sku', label: 'Codigo interno', type: 'text', required: true },
        { name: 'barcode', label: 'Codigo de barras', type: 'text' },
        {
            name: 'brand',
            label: 'Marca',
            type: 'select',
            required: true,
            options: brandOptions,
            searchable: true,
            allowCustomValue: true,
        },
        {
            name: 'category',
            label: 'Categoria',
            type: 'select',
            required: true,
            options: categoryOptions,
            searchable: true,
            allowCustomValue: true,
        },
        {
            name: 'cost',
            label: 'Custo',
            type: 'text',
            required: true,
            mask: 'currency',
        },
        {
            name: 'price',
            label: 'Preco de venda',
            type: 'text',
            required: true,
            mask: 'currency',
        },
        { name: 'stock', label: 'Estoque inicial', type: 'number', required: true },
        { name: 'minStock', label: 'Estoque minimo', type: 'number', required: true },
        { name: 'createdAt', label: 'Data de cadastro', type: 'date', required: true },
    ];
}
