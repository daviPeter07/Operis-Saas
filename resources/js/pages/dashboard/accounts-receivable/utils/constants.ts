import { Link } from '@inertiajs/react';
import { CircleCheck, Coins, ListChecks } from 'lucide-react';
import { createElement } from 'react';
import type { ServerColumn } from '@/components/table/server-table';
import { withAppBasePath } from '@/constants/workspace';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import type { FieldOption } from '@/utils/form-fields';
import { ReceivableStatusChip } from '../components/receivable-status-chip';
import type {
    ReceivableDialogText,
    ReceivableRow,
    ReceivableStatus,
    SummaryCard,
} from './types';

export const RECEIVABLES_LIST_URL = withAppBasePath(
    '/dashboard/accounts-receivable',
);

export const RECEIVABLES_BREADCRUMB = {
    title: 'Contas a Receber',
    href: '/dashboard/accounts-receivable',
};

export const RECEIVABLES_FILTER_KEYS = [
    'customer',
    'description',
    'origin',
    'status',
    'sale',
] as const;

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
    pending: 'Pendente',
    partial: 'Parcial',
    received: 'Recebida',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
};

export const RECEIVABLE_STATUS_OPTIONS: FieldOption[] = [
    { value: 'pending', label: RECEIVABLE_STATUS_LABELS.pending },
    { value: 'partial', label: RECEIVABLE_STATUS_LABELS.partial },
    { value: 'received', label: RECEIVABLE_STATUS_LABELS.received },
    { value: 'cancelled', label: RECEIVABLE_STATUS_LABELS.cancelled },
];

export const RECEIVABLE_STATUS_CHIP_CLASS: Record<ReceivableStatus, string> = {
    pending:
        'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
    partial: 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300',
    received:
        'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
    overdue: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
    cancelled: 'bg-muted text-muted-foreground ring-border',
};

export const ORIGIN_OPTIONS: FieldOption[] = [
    { value: 'sale', label: 'Venda' },
    { value: 'manual', label: 'Manual' },
];

export const CUSTOMER_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'customerName',
    header: 'Cliente',
    filter: { type: 'text', key: 'customer' },
};

export const DESCRIPTION_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'description',
    header: 'Descrição',
    filter: { type: 'text', key: 'description' },
};

export const INSTALLMENT_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'installment',
    header: 'Parcela',
    className: 'whitespace-nowrap',
};

export const ORIGIN_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'origin',
    header: 'Origem',
    className: 'whitespace-nowrap',
    // Opens the venda straight from the table.
    render: (row) =>
        row.receivable.sale_id
            ? createElement(
                  Link,
                  {
                      href: withAppBasePath(
                          `/dashboard/sales/${row.receivable.sale_id}`,
                      ),
                      className:
                          'font-medium text-accent underline-offset-4 hover:underline',
                  },
                  row.origin,
              )
            : row.origin,
    filter: {
        type: 'select',
        key: 'origin',
        allLabel: 'Todas',
        options: ORIGIN_OPTIONS,
    },
};

export const ORIGIN_EXPORT_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'origin',
    header: 'Origem',
};

export const AMOUNT_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'amount',
    header: 'Valor',
    sortKey: 'amount',
    className: 'whitespace-nowrap',
    render: (row) => formatCurrencyBR(row.amount),
};

export const STATUS_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'status',
    header: 'Status',
    render: (row) =>
        createElement(ReceivableStatusChip, { status: row.status }),
    filter: {
        type: 'select',
        key: 'status',
        allLabel: 'Todos',
        options: RECEIVABLE_STATUS_OPTIONS,
    },
};

export const STATUS_EXPORT_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'status',
    header: 'Status',
    render: (row) => RECEIVABLE_STATUS_LABELS[row.status] ?? row.status,
};

export const DUE_DATE_COLUMN: ServerColumn<ReceivableRow> = {
    key: 'dueDate',
    header: 'Vencimento',
    sortKey: 'due_date',
    className: 'whitespace-nowrap',
    render: (row) => (row.dueDate ? formatDateBR(row.dueDate) : '-'),
};

export const ENTRY_DATE_COLUMN: ServerColumn<ReceivableRow> = {
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
        label: 'Total a receber',
        icon: Coins,
        format: formatCurrencyBR,
    },
    {
        key: 'settled',
        label: 'Total recebido',
        icon: CircleCheck,
        format: formatCurrencyBR,
    },
];

// Mirrors StoreAccountReceivableRequest.
export const RECEIVABLE_LIMITS = {
    itemLength: 255,
    descriptionLength: 1000,
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
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
    { value: 'received', label: 'Recebida' },
];

// Mirrors StoreAccountReceivableRequest: one boleto per 30 days, due month by month.
export const BOLETO_TERMS = [30, 60, 90, 120, 150] as const;

export const RECEIVABLE_DIALOG_TEXT: Record<
    'create' | 'edit',
    ReceivableDialogText
> = {
    create: {
        title: 'Nova conta a receber',
        description: 'Lance um valor que um cliente vai pagar.',
        submit: 'Criar conta',
        success: 'Conta a receber criada com sucesso.',
    },
    edit: {
        title: 'Editar conta a receber',
        description: 'Ajuste os dados da conta.',
        submit: 'Salvar conta',
        success: 'Conta a receber atualizada com sucesso.',
    },
};

export const DELETE_RECEIVABLE_DIALOG = {
    title: 'Excluir conta a receber',
    description:
        'Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.',
};

export const RECEIVABLE_MESSAGES = {
    saveError: 'Não foi possível salvar a conta a receber.',
    deleteSuccess: 'Conta a receber excluída com sucesso.',
    deleteError: 'Não foi possível excluir a conta a receber.',
    settleSuccess: (count: number) =>
        count === 1
            ? 'Conta marcada como recebida.'
            : `${count} contas marcadas como recebidas.`,
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
    settle: 'Marcar como recebida',
    partial: 'Baixa parcial',
    undo: 'Desfazer baixa',
    settledOn: 'Recebida em',
    settledAmount: 'Recebido',
    partialTitle: 'Baixa parcial',
    partialAmount: 'Valor recebido agora',
};
