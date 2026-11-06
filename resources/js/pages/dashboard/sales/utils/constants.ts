import {
    Ban,
    CircleCheck,
    Coins,
    History,
    DollarSign,
    HandCoins,
    PackageCheck,
    Pencil,
    Percent,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react';
import { createElement } from 'react';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import { NamesCell } from '../components/names-cell';
import { SaleStatusChip } from '../components/sale-status-chip';
import type {
    AppliedDiscount,
    HistoryEventConfig,
    HistoryEventMap,
    SaleDialogMode,
    SaleDialogText,
    SaleRow,
    SaleStatus,
    SaleStep,
    SaleStepKey,
    SummaryCard,
} from './types';

export const SALES_LIST_URL = withAppBasePath('/dashboard/sales');

export const SALES_BREADCRUMB = {
    title: 'Vendas',
    href: '/dashboard/sales',
};

// Opened from the header and quick actions shortcut "Adicionar Venda".
export const CREATE_SALE_ACTION = 'create-sale';

export const DELETE_SALE_DIALOG = {
    title: 'Excluir venda',
    description:
        'Tem certeza que deseja excluir esta venda? O estoque volta para os produtos e as parcelas são removidas. Esta ação não pode ser desfeita.',
};

export const CANCEL_SALE_DIALOG = {
    title: 'Cancelar venda',
    description:
        'A venda fica registrada como cancelada, o estoque volta para os produtos e as parcelas em aberto são canceladas.',
    confirmLabel: 'Cancelar venda',
    cancelLabel: 'Voltar',
};

export const SALES_FILTER_KEYS = [
    'customer',
    'product',
    'category_id',
    'brand_id',
    'status',
    'payment_method',
] as const;

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
    pending: 'Pendente',
    completed: 'Concluída',
    cancelled: 'Cancelada',
};

export const SALE_STATUS_OPTIONS: FieldOption[] = [
    { value: 'pending', label: SALE_STATUS_LABELS.pending },
    { value: 'completed', label: SALE_STATUS_LABELS.completed },
    { value: 'cancelled', label: SALE_STATUS_LABELS.cancelled },
];

export const SALE_STATUS_CHIP_CLASS: Record<SaleStatus, string> = {
    pending:
        'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
    completed:
        'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
    cancelled: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
};

// card and installment are older methods still present in past sales.
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card_debit: 'Cartão de débito',
    card_credit: 'Cartão de crédito',
    crediario: 'Crediário',
    card: 'Cartão',
    installment: 'Parcelado',
};

export const PAYMENT_METHOD_OPTIONS: FieldOption[] = Object.entries(
    PAYMENT_METHOD_LABELS,
).map(([value, label]) => ({ value, label }));

export const CHECKOUT_PAYMENT_OPTIONS = [
    { value: 'money', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'card', label: 'Cartão' },
    { value: 'crediario', label: 'Crediário' },
] as const;

export const DATE_COLUMN: ServerColumn<SaleRow> = {
    key: 'date',
    header: 'Data',
    sortKey: 'date',
    className: 'whitespace-nowrap',
    render: (row) => formatDateBR(row.date),
};

export const CUSTOMER_COLUMN: ServerColumn<SaleRow> = {
    key: 'customerName',
    header: 'Cliente',
    filter: { type: 'text', key: 'customer' },
};

export const PRODUCT_COLUMN: ServerColumn<SaleRow> = {
    key: 'productNames',
    header: 'Produto',
    render: (row) => createElement(NamesCell, { names: row.productNames }),
    filter: { type: 'text', key: 'product' },
};

export const PRODUCT_EXPORT_COLUMN: ServerColumn<SaleRow> = {
    key: 'productList',
    header: 'Produto',
};

export const CATEGORY_EXPORT_COLUMN: ServerColumn<SaleRow> = {
    key: 'categoryList',
    header: 'Categoria',
};

export const BRAND_EXPORT_COLUMN: ServerColumn<SaleRow> = {
    key: 'brandList',
    header: 'Marca',
};

export const TOTAL_COLUMN: ServerColumn<SaleRow> = {
    key: 'total',
    header: 'Total',
    sortKey: 'total',
    className: 'whitespace-nowrap',
    render: (row) => formatCurrencyBR(row.total),
};

export const PROFIT_COLUMN: ServerColumn<SaleRow> = {
    key: 'profit',
    header: 'Lucro',
    sortKey: 'profit',
    className: 'whitespace-nowrap',
    render: (row) => formatCurrencyBR(row.profit),
};

export const STATUS_COLUMN: ServerColumn<SaleRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => createElement(SaleStatusChip, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: SALE_STATUS_OPTIONS,
    },
};

export const STATUS_EXPORT_COLUMN: ServerColumn<SaleRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => SALE_STATUS_LABELS[row.status],
};

export const PAYMENT_METHOD_COLUMN: ServerColumn<SaleRow> = {
    key: 'paymentMethod',
    header: 'M. Pagamento',
    className: 'whitespace-nowrap',
    render: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod] ?? '-',
    filter: {
        type: 'select',
        key: 'payment_method',
        allLabel: 'Todos',
        options: PAYMENT_METHOD_OPTIONS,
    },
};

export const INSTALLMENTS_COLUMN: ServerColumn<SaleRow> = {
    key: 'installments',
    header: 'Parcela',
    render: (row) => `${row.installments}x`,
};

export const SUMMARY_CARDS: SummaryCard[] = [
    {
        key: 'count',
        label: 'Quantidade de vendas',
        icon: TrendingUp,
        format: String,
    },
    {
        key: 'total',
        label: 'Valor em vendas',
        icon: DollarSign,
        format: formatCurrencyBR,
    },
    {
        key: 'profit',
        label: 'Lucros',
        icon: Percent,
        format: formatCurrencyBR,
    },
    {
        key: 'receivable',
        label: 'Total a receber',
        icon: Coins,
        format: formatCurrencyBR,
    },
];

export const HISTORY_EVENTS: HistoryEventMap = {
    created: { title: 'Venda criada', icon: ShoppingCart, tone: 'default' },
    updated: { title: 'Venda editada', icon: Pencil, tone: 'default' },
    payment_received: {
        title: 'Pagamento recebido',
        icon: HandCoins,
        tone: 'success',
    },
    completed: { title: 'Venda concluída', icon: CircleCheck, tone: 'success' },
    cancelled: { title: 'Venda cancelada', icon: Ban, tone: 'danger' },
    delivered: {
        title: 'Venda marcada como entregue',
        icon: PackageCheck,
        tone: 'success',
    },
};

// Event types the screen does not know yet still show, with the API description.
export const UNKNOWN_HISTORY_EVENT: HistoryEventConfig = {
    title: 'Registro na venda',
    icon: History,
    tone: 'default',
};

// Mirrors the notes column validation on StoreSaleRequest.
export const SALE_LIMITS = {
    notesLength: 1000,
} as const;

export const SALE_DIALOG_TEXT: Record<SaleDialogMode, SaleDialogText> = {
    create: {
        title: 'Criar venda',
        description: 'Cliente, itens, pagamento e fechamento.',
        success: 'Venda criada com sucesso.',
        error: 'Não foi possível criar a venda.',
    },
    edit: {
        title: 'Editar venda',
        description: 'Ajuste cliente, itens, pagamento e fechamento.',
        success: 'Venda atualizada com sucesso.',
        error: 'Não foi possível atualizar a venda.',
    },
};

export const NO_DISCOUNT: AppliedDiscount = { type: 'amount', value: 0 };

// Default first crediário due date, counted from the sale date.
export const CREDIARIO_FIRST_DUE_DAYS = 30;

// Days of credit term per crediário installment.
export const CREDIARIO_DAYS_PER_INSTALLMENT = 30;

export const STOCK_WARNING_FALLBACK =
    'Estoque insuficiente para concluir a venda.';

export const SALE_MESSAGES = {
    chooseClient: 'Selecione um cliente válido para continuar.',
    addItem: 'Adicione ao menos um item válido na venda.',
    entryRequired: 'Informe uma entrada maior que zero.',
    entryTooHigh: 'A entrada precisa ser menor que o total da venda.',
    discountPercent: 'O desconto não pode passar de 100%.',
    discountAmount: 'O desconto não pode ser maior que o subtotal.',
    creditDisabled: 'Este cliente não tem crediário habilitado.',
    creditExceeded:
        'O saldo financiado passa do limite disponível do crediário.',
    printError: 'Não foi possível abrir o comprovante.',
    cancelSuccess: 'Venda cancelada com sucesso.',
    cancelError: 'Não foi possível cancelar a venda.',
    deleteSuccess: 'Venda excluída com sucesso.',
    deleteError: 'Não foi possível excluir a venda.',
};

export const SALE_STEPS: SaleStep[] = [
    { key: 'products', label: 'Produtos', description: 'Escolha os itens' },
    {
        key: 'cart',
        label: 'Cliente e carrinho',
        description: 'Revise o pedido',
    },
    { key: 'payment', label: 'Pagamento', description: 'Forma e data' },
    { key: 'summary', label: 'Resumo', description: 'Confira e registre' },
];

export const SALE_STEP_HINTS: Record<SaleStepKey, string> = {
    products: 'Adicione ao menos um produto para continuar.',
    cart: 'Escolha o cliente para continuar.',
    payment: 'Confira a forma de pagamento para continuar.',
    summary: '',
};
