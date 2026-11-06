import type { LucideIcon } from 'lucide-react';
import type { AccountPayable } from '@/schemas/accountPayable';

export type ApiParams = Record<string, string>;

export type PayableStatus = AccountPayable['status'];

export type PayableRow = {
    id: string;
    payable: AccountPayable;
    supplierName: string;
    description: string;
    installment: string;
    origin: string;
    amount: number;
    remaining: number;
    status: PayableStatus;
    dueDate: string | null;
    entryDate: string | null;
};

export type PayablesTotals = {
    count: number;
    open: number;
    settled: number;
};

export type SummaryCard = {
    key: keyof PayablesTotals;
    label: string;
    icon: LucideIcon;
    format: (value: number) => string;
};

export type SummaryCardsProps = {
    apiParams: ApiParams;
};

export type PayablesShowPageProps = {
    payableId: number;
};

export type ManualPaymentMethod = 'cash' | 'pix' | 'card' | 'boleto';

export type BoletoTerm = 30 | 60 | 90 | 120 | 150;

export type PayableFormValues = {
    supplier_id: string;
    item: string;
    amount: string;
    entry_date: string;
    due_date: string;
    payment_method: ManualPaymentMethod;
    boleto_term_days: '30' | '60' | '90' | '120' | '150';
    status: 'pending' | 'paid';
    description: string;
};

export type PayableSubmitData = {
    supplier_id: number;
    item: string;
    description?: string;
    amount: number;
    entry_date: string;
    due_date: string;
    payment_method: ManualPaymentMethod;
    status: 'pending' | 'paid';
    boleto_term_days?: BoletoTerm;
};

export type PayableDialogText = {
    title: string;
    description: string;
    submit: string;
    success: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payable?: AccountPayable | null;
};

export type PayableStatusChipProps = {
    status: PayableStatus;
};

export type SelectionBarProps = {
    rows: PayableRow[];
    isProcessing: boolean;
    onSettle: () => void;
    onPartial: () => void;
    onUndo: () => void;
    onClear: () => void;
};

export type PartialSettleDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: PayableRow | null;
    isSubmitting: boolean;
    onConfirm: (amount: number) => void;
};

export type PayableDetailsProps = {
    payable: AccountPayable;
};

export type OriginFilterNoticeProps = {
    originId: string;
    onClear: () => void;
};
