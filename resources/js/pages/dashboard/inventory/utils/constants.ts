import { Boxes, DollarSign } from 'lucide-react';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatQuantityWithUnit } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import type {
    ProductDialogMode,
    ProductDialogText,
    ProductRow,
    QuickCreateState,
    QuickCreateText,
    QuickCreateType,
    SummaryCard,
} from './types';

export const INVENTORY_LIST_URL = withAppBasePath('/dashboard/inventory');

export const INVENTORY_BREADCRUMB = {
    title: 'Estoque',
    href: '/dashboard/inventory',
};

export const DELETE_PRODUCT_DIALOG = {
    title: 'Excluir produto',
    description:
        'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
};

export const INVENTORY_FILTER_KEYS = [
    'name',
    'sku',
    'brand_id',
    'category_id',
    'stock_status',
    'status',
] as const;

// Inactive products (from imports) stay out of the inventory.
export const INVENTORY_DEFAULT_FILTERS = { status: 'active' } as const;

export const STOCK_STATUS_OPTIONS: FieldOption[] = [
    { value: 'out_of_stock', label: 'Sem estoque' },
    { value: 'below_minimum', label: 'Abaixo do mínimo' },
];

export const NEGATIVE_STOCK_ROW_CLASS =
    'border-red-500/40 bg-red-500/5 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';

export const SUMMARY_CARDS: SummaryCard[] = [
    {
        key: 'costValue',
        label: 'Valor total em custo',
        icon: DollarSign,
        format: formatCurrencyBR,
    },
    {
        key: 'saleValue',
        label: 'Valor total em venda',
        icon: DollarSign,
        format: formatCurrencyBR,
    },
    {
        key: 'quantity',
        label: 'Quantidade total em estoque',
        icon: Boxes,
        format: formatQuantityWithUnit,
    },
];

export const NAME_COLUMN: ServerColumn<ProductRow> = {
    key: 'name',
    header: 'Produto',
    sortKey: 'name',
    filter: { type: 'text', key: 'name' },
};

// The API also matches the barcode, so a scanned code finds the product.
export const SKU_COLUMN: ServerColumn<ProductRow> = {
    key: 'sku',
    header: 'Código',
    sortKey: 'sku',
    filter: { type: 'text', key: 'sku' },
};

export const BARCODE_COLUMN: ServerColumn<ProductRow> = {
    key: 'barcode',
    header: 'Código de barras',
    render: (row) => row.barcode || 'Sem código',
};

export const COST_COLUMN: ServerColumn<ProductRow> = {
    key: 'cost',
    header: 'Preço de custo',
    render: (row) => formatCurrencyBR(row.cost),
};

export const SALE_PRICE_COLUMN: ServerColumn<ProductRow> = {
    key: 'sale_price',
    header: 'Preço de venda',
    sortKey: 'sale_price',
    render: (row) => formatCurrencyBR(row.sale_price),
};

export const STOCK_COLUMN: ServerColumn<ProductRow> = {
    key: 'stock',
    header: 'Estoque',
    sortKey: 'stock',
    render: (row) => formatQuantityWithUnit(row.stock),
    filter: {
        type: 'select',
        key: 'stock_status',
        allLabel: 'Todos',
        options: STOCK_STATUS_OPTIONS,
    },
};

export const MIN_STOCK_COLUMN: ServerColumn<ProductRow> = {
    key: 'min_stock',
    header: 'Estoque mínimo',
    render: (row) => formatQuantityWithUnit(row.min_stock),
};

export const STOCK_STEPS = [-10, -1, 1, 10] as const;

export const PRODUCT_DIALOG_TEXT: Record<ProductDialogMode, ProductDialogText> =
    {
        create: {
            title: 'Novo produto',
            description:
                'Cadastre um produto com dados comerciais e de estoque.',
            submit: 'Criar produto',
        },
        edit: {
            title: 'Editar produto',
            description:
                'Atualize os dados comerciais e de estoque do produto.',
            submit: 'Salvar alterações',
        },
    };

export const QUICK_CREATE_TEXT: Record<QuickCreateType, QuickCreateText> = {
    brand: {
        title: 'Nova marca',
        description: 'Adicione uma marca sem sair do produto.',
        placeholder: 'Digite o nome da marca',
        submit: 'Criar marca',
        success: 'Marca criada com sucesso.',
        error: 'Não foi possível criar a marca.',
    },
    category: {
        title: 'Nova categoria',
        description: 'Adicione uma categoria sem sair do produto.',
        placeholder: 'Digite o nome da categoria',
        submit: 'Criar categoria',
        success: 'Categoria criada com sucesso.',
        error: 'Não foi possível criar a categoria.',
    },
};

export const COST_TOOLTIP =
    'Quanto você pagou ao fornecedor por uma unidade deste produto. É usado para calcular o lucro das vendas.';

export const SALE_PRICE_TOOLTIP =
    'Quanto o cliente paga por uma unidade deste produto. É o preço que aparece na venda.';

export const CLOSED_QUICK_CREATE: QuickCreateState = { type: null, name: '' };

// Mirrors StoreProductRequest and the products table (decimal 14,2).
export const PRODUCT_LIMITS = {
    nameLength: 255,
    skuLength: 80,
    barcodeLength: 80,
    descriptionLength: 65535,
    maxAmount: 999_999_999_999.99,
    quickCreateNameLength: 255,
} as const;

export const SAVE_PRODUCT_ERROR = 'Não foi possível salvar o produto.';
