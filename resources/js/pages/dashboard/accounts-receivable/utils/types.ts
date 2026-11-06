import type { LucideIcon } from 'lucide-react';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';

export type ApiParams = Record<string, string>;

export type ReceivableStatus = AccountReceivable['status'];

export type ReceivableRow = {
    id: string;
    receivable: AccountReceivable;
    customerName: string;
    description: string;
    installment: string;
    origin: string;
    amount: number;
    remaining: number;
    status: ReceivableStatus;
    dueDate: string | null;
    entryDate: string | null;
};

export type ReceivablesTotals = {
    count: number;
    open: number;
    settled: number;
};

export type SummaryCard = {
    key: keyof ReceivablesTotals;
    label: string;
    icon: LucideIcon;
    format: (value: number) => string;
};

export type SummaryCardsProps = {
    apiParams: ApiParams;
};

export type ReceivablesShowPageProps = {
    receivableId: number;
};

// What the form shows (card splits into debit/credit), like the sale checkout.
export type ManualPaymentMethod = 'cash' | 'pix' | 'card' | 'crediario';

// What the API stores, the same values as a sale.
export type ReceivablePaymentMethod =
    | 'cash'
    | 'pix'
    | 'card_debit'
    | 'card_credit'
    | 'crediario';

export type CardType = 'debit' | 'credit';

export type ManualPaymentOption = {
    value: ManualPaymentMethod;
    label: string;
    hint: string;
    icon: LucideIcon;
};

export type CrediarioInstallment = {
    number: number;
    dueDate: string;
    amount: number;
};

export type ReceivableFormValues = {
    customer_id: string;
    item: string;
    amount: string;
    entry_date: string;
    due_date: string;
    payment_method: ManualPaymentMethod;
    card_type: CardType;
    installments: string;
    status: 'pending' | 'received';
    description: string;
};

export type ReceivableSubmitData = {
    customer_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
    due_date: string;
    payment_method: ReceivablePaymentMethod;
    status: 'pending' | 'received';
    installments?: number;
};

export type ReceivableDialogText = {
    title: string;
    description: string;
    submit: string;
    success: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receivable?: AccountReceivable | null;
};

export type ReceivableStatusChipProps = {
    status: ReceivableStatus;
};

export type SelectionBarProps = {
    rows: ReceivableRow[];
    isProcessing: boolean;
    onSettle: () => void;
    onPartial: () => void;
    onUndo: () => void;
    onClear: () => void;
};

export type PartialSettleDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: ReceivableRow | null;
    isSubmitting: boolean;
    onConfirm: (amount: number) => void;
};

export type ReceivableDetailsProps = {
    receivable: AccountReceivable;
};

export type NewClientData = NonNullable<ClientCreateDialogProps['initialData']>;

export type OriginFilterNoticeProps = {
    originId: string;
    onClear: () => void;
};
