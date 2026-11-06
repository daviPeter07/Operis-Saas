import {
    Ban,
    Banknote,
    CircleCheck,
    CreditCard,
    DollarSign,
    FileText,
    HandCoins,
    History,
    Pencil,
    QrCode,
    ShoppingBag,
} from 'lucide-react';
import { createElement } from 'react';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import { NamesCell } from '../components/names-cell';
import { PurchaseStatusChip } from '../components/purchase-status-chip';
import type {
    BoletoTerm,
    CheckoutPaymentOption,
    HistoryEventConfig,
    HistoryEventMap,
    PurchaseDialogMode,
    PurchaseDialogText,
    PurchasePaymentAnswer,
    PurchaseRow,
    PurchaseStatus,
    PurchaseStep,
    PurchaseStepKey,
    SummaryCard,
} from './types';

export const PURCHASES_LIST_URL = withAppBasePath('/dashboard/purchases');

export const PURCHASES_BREADCRUMB = {
    title: 'Compras',
    href: '/dashboard/purchases',
};

// Opened from the header and quick actions shortcut "Adicionar Compra".
export const CREATE_PURCHASE_ACTION = 'create-purchase';

export const DELETE_PURCHASE_DIALOG = {
    title: 'Excluir compra',
    description:
        'Tem certeza que deseja excluir esta compra? Os produtos saem do estoque e as contas a pagar dela são removidas. Esta ação não pode ser desfeita.',
};

export const CANCEL_PURCHASE_DIALOG = {
    title: 'Cancelar compra',
    description:
        'A compra fica registrada como cancelada, os produtos saem do estoque e as contas a pagar dela são canceladas.',
    confirmLabel: 'Cancelar compra',
    cancelLabel: 'Voltar',
};

export const PURCHASES_FILTER_KEYS = [
    'supplier',
    'product',
    'category_id',
    'brand_id',
    'status',
    'payment_method',
] as const;

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
    pending: 'Pendente',
    completed: 'Concluída',
    cancelled: 'Cancelada',
};

export const PURCHASE_STATUS_OPTIONS: FieldOption[] = [
    { value: 'pending', label: PURCHASE_STATUS_LABELS.pending },
    { value: 'completed', label: PURCHASE_STATUS_LABELS.completed },
    { value: 'cancelled', label: PURCHASE_STATUS_LABELS.cancelled },
];

export const PURCHASE_STATUS_CHIP_CLASS: Record<PurchaseStatus, string> = {
    pending:
        'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
    completed:
        'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
    cancelled: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
};

// installment is an older method still present in past purchases.
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    boleto: 'Boleto',
    installment: 'Parcelado',
};

export const PAYMENT_METHOD_OPTIONS: FieldOption[] = Object.entries(
    PAYMENT_METHOD_LABELS,
).map(([value, label]) => ({ value, label }));

export const CHECKOUT_PAYMENT_OPTIONS: CheckoutPaymentOption[] = [
    { value: 'money', label: 'Dinheiro', hint: 'Na hora', icon: Banknote },
    { value: 'pix', label: 'PIX', hint: 'Transferência', icon: QrCode },
    {
        value: 'card',
        label: 'Cartão',
        hint: 'Débito ou crédito',
        icon: CreditCard,
    },
    {
        value: 'boleto',
        label: 'Boleto',
        hint: '1 a 5 boletos',
        icon: FileText,
    },
];

// Mirrors StorePurchaseRequest: each 30 days is one more boleto (60 = 2 boletos, at 30 and 60 days).
export const BOLETO_TERMS: BoletoTerm[] = [30, 60, 90, 120, 150];

export const BOLETO_DAYS_PER_INSTALLMENT = 30;

export const DATE_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'date',
    header: 'Data',
    sortKey: 'date',
    className: 'whitespace-nowrap',
    render: (row) => formatDateBR(row.date),
};

export const DUE_DATE_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'dueDate',
    header: 'Vencimento',
    sortKey: 'due_date',
    className: 'whitespace-nowrap',
    render: (row) => (row.dueDate ? formatDateBR(row.dueDate) : '-'),
};

export const SUPPLIER_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'supplierName',
    header: 'Fornecedor',
    filter: { type: 'text', key: 'supplier' },
};

export const PRODUCT_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'productNames',
    header: 'Produto',
    render: (row) => createElement(NamesCell, { names: row.productNames }),
    filter: { type: 'text', key: 'product' },
};

export const PRODUCT_EXPORT_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'productList',
    header: 'Produto',
};

export const CATEGORY_EXPORT_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'categoryList',
    header: 'Categoria',
};

export const BRAND_EXPORT_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'brandList',
    header: 'Marca',
};

export const TOTAL_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'total',
    header: 'Total',
    sortKey: 'total',
    className: 'whitespace-nowrap',
    render: (row) => formatCurrencyBR(row.total),
};

export const STATUS_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => createElement(PurchaseStatusChip, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: PURCHASE_STATUS_OPTIONS,
    },
};

export const STATUS_EXPORT_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => PURCHASE_STATUS_LABELS[row.status],
};

export const PAYMENT_METHOD_COLUMN: ServerColumn<PurchaseRow> = {
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

export const BOLETOS_COLUMN: ServerColumn<PurchaseRow> = {
    key: 'boletos',
    header: 'Boletos',
    className: 'whitespace-nowrap',
    render: (row) => (row.boletos > 0 ? `${row.boletos}x` : '-'),
};

export const SUMMARY_CARDS: SummaryCard[] = [
    {
        key: 'count',
        label: 'Quantidade de compras',
        icon: ShoppingBag,
        format: String,
    },
    {
        key: 'total',
        label: 'Valor em compras',
        icon: DollarSign,
        format: formatCurrencyBR,
    },
    {
        key: 'payable',
        label: 'Total a pagar',
        icon: HandCoins,
        format: formatCurrencyBR,
    },
];

export const HISTORY_EVENTS: HistoryEventMap = {
    created: { title: 'Compra registrada', icon: ShoppingBag, tone: 'default' },
    updated: { title: 'Compra editada', icon: Pencil, tone: 'default' },
    payment_made: {
        title: 'Pagamento feito',
        icon: HandCoins,
        tone: 'success',
    },
    completed: {
        title: 'Compra concluída',
        icon: CircleCheck,
        tone: 'success',
    },
    cancelled: { title: 'Compra cancelada', icon: Ban, tone: 'danger' },
};

// Event types the screen does not know yet still show, with the API description.
export const UNKNOWN_HISTORY_EVENT: HistoryEventConfig = {
    title: 'Registro na compra',
    icon: History,
    tone: 'default',
};

// Mirrors the notes column validation on StorePurchaseRequest.
export const PURCHASE_LIMITS = {
    notesLength: 1000,
} as const;

export const PURCHASE_DIALOG_TEXT: Record<
    PurchaseDialogMode,
    PurchaseDialogText
> = {
    create: {
        title: 'Criar compra',
        description: 'Fornecedor, itens, pagamento e fechamento.',
        success: 'Compra criada com sucesso.',
        error: 'Não foi possível criar a compra.',
    },
    edit: {
        title: 'Editar compra',
        description: 'Ajuste fornecedor, itens, pagamento e fechamento.',
        success: 'Compra atualizada com sucesso.',
        error: 'Não foi possível atualizar a compra.',
    },
};

export const PURCHASE_MESSAGES = {
    cancelSuccess: 'Compra cancelada com sucesso.',
    cancelError: 'Não foi possível cancelar a compra.',
    deleteSuccess: 'Compra excluída com sucesso.',
    deleteError: 'Não foi possível excluir a compra.',
    productCreated: 'Produto criado com sucesso.',
};

export const PURCHASE_STEPS: PurchaseStep[] = [
    { key: 'products', label: 'Produtos', description: 'Escolha os itens' },
    {
        key: 'cart',
        label: 'Fornecedor e carrinho',
        description: 'Revise o pedido',
    },
    { key: 'payment', label: 'Pagamento', description: 'Forma e data' },
    { key: 'summary', label: 'Resumo', description: 'Confira e registre' },
];

export const PURCHASE_STEP_HINTS: Record<PurchaseStepKey, string> = {
    products: 'Adicione ao menos um produto para continuar.',
    cart: 'Escolha o fornecedor para continuar.',
    payment: 'Confira a forma de pagamento para continuar.',
    summary: '',
};

export const PURCHASE_PAYMENT_ANSWERS: PurchasePaymentAnswer[] = [
    {
        value: 'pending',
        label: 'Pendente',
        description: 'Ainda não paguei',
    },
    {
        value: 'completed',
        label: 'Paga',
        description: 'Já paguei o fornecedor',
    },
];
