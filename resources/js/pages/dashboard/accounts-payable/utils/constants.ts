import { CircleCheck, Coins, ListChecks } from 'lucide-react';
import { createElement } from 'react';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import { PayableStatusChip } from '../components/payable-status-chip';
import type {
    PayableDialogText,
    PayableRow,
    PayableStatus,
    SummaryCard,
} from './types';

export const PAYABLES_LIST_URL = withAppBasePath('/dashboard/accounts-payable');

export const PAYABLES_BREADCRUMB = {
    title: 'Contas a Pagar',
    href: '/dashboard/accounts-payable',
};

export const PAYABLES_FILTER_KEYS = [
    'supplier',
    'description',
    'origin',
    'status',
] as const;

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
    pending: 'Pendente',
    partial: 'Parcial',
    paid: 'Paga',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
};

export const PAYABLE_STATUS_OPTIONS: FieldOption[] = [
    { value: 'pending', label: PAYABLE_STATUS_LABELS.pending },
    { value: 'partial', label: PAYABLE_STATUS_LABELS.partial },
    { value: 'paid', label: PAYABLE_STATUS_LABELS.paid },
    { value: 'cancelled', label: PAYABLE_STATUS_LABELS.cancelled },
];

export const PAYABLE_STATUS_CHIP_CLASS: Record<PayableStatus, string> = {
    pending:
        'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
    partial: 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300',
    paid: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
    overdue: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
    cancelled: 'bg-muted text-muted-foreground ring-border',
};

export const ORIGIN_OPTIONS: FieldOption[] = [
    { value: 'purchase', label: 'Compra' },
    { value: 'manual', label: 'Manual' },
];

export const SUPPLIER_COLUMN: ServerColumn<PayableRow> = {
    key: 'supplierName',
    header: 'Fornecedor',
    filter: { type: 'text', key: 'supplier' },
};

export const DESCRIPTION_COLUMN: ServerColumn<PayableRow> = {
    key: 'description',
    header: 'Descrição',
    filter: { type: 'text', key: 'description' },
};

export const INSTALLMENT_COLUMN: ServerColumn<PayableRow> = {
    key: 'installment',
    header: 'Parcela',
    className: 'whitespace-nowrap',
};

export const ORIGIN_COLUMN: ServerColumn<PayableRow> = {
    key: 'origin',
    header: 'Origem',
    className: 'whitespace-nowrap',
    filter: {
        type: 'select',
        key: 'origin',
        allLabel: 'Todas',
        options: ORIGIN_OPTIONS,
    },
};

export const AMOUNT_COLUMN: ServerColumn<PayableRow> = {
    key: 'amount',
    header: 'Valor',
    sortKey: 'amount',
    className: 'whitespace-nowrap',
    render: (row) => formatCurrencyBR(row.amount),
};

export const STATUS_COLUMN: ServerColumn<PayableRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => createElement(PayableStatusChip, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: PAYABLE_STATUS_OPTIONS,
    },
};

export const STATUS_EXPORT_COLUMN: ServerColumn<PayableRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => PAYABLE_STATUS_LABELS[row.status] ?? row.status,
};

export const DUE_DATE_COLUMN: ServerColumn<PayableRow> = {
    key: 'dueDate',
    header: 'Vencimento',
    sortKey: 'due_date',
    className: 'whitespace-nowrap',
    render: (row) => (row.dueDate ? formatDateBR(row.dueDate) : '-'),
};

export const ENTRY_DATE_COLUMN: ServerColumn<PayableRow> = {
    key: 'entryDate',
    header: 'Lançamento',
    sortKey: 'entry_date',
    className: 'whitespace-nowrap',
    render: (row) => (row.entryDate ? formatDateBR(row.entryDate) : '-'),
};

export const SUMMARY_CARDS: SummaryCard[] = [
    {
        key: 'count',
        label: 'Quantidade de contas',
        icon: ListChecks,
        format: String,
    },
    {
        key: 'open',
        label: 'Total a pagar',
        icon: Coins,
        format: formatCurrencyBR,
    },
    {
        key: 'settled',
        label: 'Total pago',
        icon: CircleCheck,
        format: formatCurrencyBR,
    },
];

// Mirrors StoreAccountPayableRequest.
export const PAYABLE_LIMITS = {
    itemLength: 255,
    descriptionLength: 1000,
} as const;

// installment is an older method still present in past payments.
export const PAID_METHOD_LABELS: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    installment: 'Parcelado',
    boleto: 'Boleto',
};

export const MANUAL_PAYMENT_OPTIONS: FieldOption[] = [
    { value: 'pix', label: 'PIX' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'card', label: 'Cartão' },
    { value: 'boleto', label: 'Boleto' },
];

export const MANUAL_STATUS_OPTIONS: FieldOption[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Paga' },
];

// Mirrors StoreAccountPayableRequest: one boleto per 30 days, due month by month.
export const BOLETO_TERMS = [30, 60, 90, 120, 150] as const;

// The settle buttons record the payment with this method, as the old screen did.
export const DEFAULT_PAID_METHOD = 'pix';

export const PAYABLE_DIALOG_TEXT: Record<'create' | 'edit', PayableDialogText> =
    {
        create: {
            title: 'Nova conta a pagar',
            description: 'Lance um valor que você vai pagar a um fornecedor.',
            submit: 'Criar conta',
            success: 'Conta a pagar criada com sucesso.',
        },
        edit: {
            title: 'Editar conta a pagar',
            description: 'Ajuste os dados da conta.',
            submit: 'Salvar conta',
            success: 'Conta a pagar atualizada com sucesso.',
        },
    };

export const DELETE_PAYABLE_DIALOG = {
    title: 'Excluir conta a pagar',
    description:
        'Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.',
};

export const PAYABLE_MESSAGES = {
    saveError: 'Não foi possível salvar a conta a pagar.',
    deleteSuccess: 'Conta a pagar excluída com sucesso.',
    deleteError: 'Não foi possível excluir a conta a pagar.',
    settleSuccess: (count: number) =>
        count === 1
            ? 'Conta marcada como paga.'
            : `${count} contas marcadas como pagas.`,
    undoSuccess: (count: number) =>
        count === 1 ? 'Baixa desfeita.' : `${count} baixas desfeitas.`,
    partialFailures: (failed: number, total: number) =>
        `${failed} de ${total} não foram processadas. Tente novamente.`,
    partialSuccess: 'Baixa parcial aplicada com sucesso.',
    partialError: 'Não foi possível aplicar a baixa parcial.',
    partialTooHigh: 'O valor passa do saldo em aberto da conta.',
    partialRequired: 'Informe um valor maior que zero.',
};

export const SETTLE_LABELS = {
    settle: 'Marcar como paga',
    partial: 'Baixa parcial',
    undo: 'Desfazer baixa',
    settledOn: 'Pago em',
    settledAmount: 'Pago',
    partialTitle: 'Baixa parcial',
    partialAmount: 'Valor pago agora',
};
