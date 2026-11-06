import type { LucideIcon } from 'lucide-react';
import type { HistoryTimelineTone } from '@/components/history-timeline';
import type { SaleMutationInput } from '@/hooks/use-sales';
import type { AccountReceivable } from '@/schemas/accountReceivable';
import type { Customer } from '@/schemas/customer';
import type { Sale, SaleHistoryType } from '@/schemas/sale';
import type {
    UiCustomer,
    UiPaymentMethod,
    UiProduct,
} from '@/types/dashboard-entities';
import type { ClientCreateDialogProps } from '@/types/dashboard-forms';
import type { SalesLineItem } from '@/types/sales-dialog';
import type { FieldOption } from '@/utils/form-fields';

export type ApiParams = Record<string, string>;

export type SaleStatus = Sale['status'];

export type ApiPaymentMethod = SaleMutationInput['payment_method'];

export type CardType = 'debit' | 'credit';

export type SaleDiscountType = 'amount' | 'percent';

export type AppliedDiscount = {
    type: SaleDiscountType;
    value: number;
};

export type SaleRow = {
    id: string;
    sale: Sale;
    date: string;
    customerName: string;
    productNames: string[];
    categoryNames: string[];
    brandNames: string[];
    productList: string;
    categoryList: string;
    brandList: string;
    total: number;
    profit: number;
    status: SaleStatus;
    paymentMethod: string;
    installments: number;
};

export type SalesFilterOptions = {
    brands: FieldOption[];
    categories: FieldOption[];
};

export type SalesTotals = {
    count: number;
    total: number;
    profit: number;
    receivable: number;
};

export type SummaryCard = {
    key: keyof SalesTotals;
    label: string;
    icon: LucideIcon;
    format: (value: number) => string;
};

export type SummaryCardsProps = {
    apiParams: ApiParams;
};

export type SalesShowPageProps = {
    saleId: number;
};

export type HistoryEventConfig = {
    title: string;
    icon: LucideIcon;
    tone: HistoryTimelineTone;
};

export type HistoryEventMap = Record<SaleHistoryType, HistoryEventConfig>;

export type SaleDialogMode = 'create' | 'edit';

export type SaleDialogText = {
    title: string;
    description: string;
    success: string;
    error: string;
};

export type SaleFormInitial = {
    clientId: string;
    lineItems: SalesLineItem[];
    date: string;
    paymentMethod: UiPaymentMethod;
    cardType: CardType;
    installments: string;
    crediarioEntry: string;
    discount: AppliedDiscount;
};

export type CrediarioSummary = {
    entry: number;
    financed: number;
    installments: number;
    installmentValue: number;
    maxInstallments: number;
    availableCredit: number;
    creditEnabled: boolean;
    exceeded: boolean;
    entryError: string | null;
};

export type SaleFormState = {
    clientId: string;
    setClientId: (value: string) => void;
    selectedClient: UiCustomer | undefined;
    lineItems: SalesLineItem[];
    addProduct: (product: UiProduct, quantity: number, price: number) => void;
    increaseQuantity: (itemId: string) => void;
    decreaseQuantity: (itemId: string) => void;
    removeItem: (itemId: string) => void;
    productSearch: string;
    setProductSearch: (value: string) => void;
    isScannerReady: boolean;
    toggleScanner: () => void;
    paymentMethod: UiPaymentMethod;
    setPaymentMethod: (value: UiPaymentMethod) => void;
    cardType: CardType;
    setCardType: (value: CardType) => void;
    installments: string;
    setInstallments: (value: string) => void;
    crediarioEntry: string;
    setCrediarioEntry: (value: string) => void;
    firstInstallmentDate: string;
    setFirstInstallmentDate: (value: string) => void;
    saleDate: string;
    setSaleDate: (value: string) => void;
    notes: string;
    setNotes: (value: string) => void;
    discount: AppliedDiscount;
    setDiscount: (value: AppliedDiscount) => void;
    subtotal: number;
    discountAmount: number;
    total: number;
    crediario: CrediarioSummary;
    canSubmit: boolean;
};

export type SaleDraft = {
    saleId?: number;
    clientId: string;
    clientName: string;
    date: string;
    lineItems: SalesLineItem[];
    paymentMethod: UiPaymentMethod;
    cardType: CardType;
    subtotal: number;
    discount: number;
    total: number;
    installments: number;
    firstInstallmentDate?: string;
    installmentValue?: number;
    crediarioEntry?: number;
    paidInstallments: number[];
    status: 'pending' | 'completed';
};

export type StockWarning = {
    message: string;
    payload: SaleMutationInput;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale?: Sale | null;
};

export type SaleFormProps = {
    title: string;
    description: string;
    initial: SaleFormInitial;
    saleId?: number;
    saleStatus?: SaleStatus;
    customers: Customer[];
    clients: UiCustomer[];
    products: UiProduct[];
    paidInstallments: number[];
    isSubmitting: boolean;
    onSubmit: (draft: SaleDraft) => void;
};

export type CheckoutPanelProps = {
    form: SaleFormState;
    title: string;
    description: string;
    clientOptions: FieldOption[];
    onCreateClient: (name: string) => void;
    onEditClient: () => void;
    onOpenDiscount: () => void;
    onSubmit: () => void;
};

export type CheckoutSectionProps = {
    form: SaleFormState;
};

export type ClientSectionProps = {
    form: SaleFormState;
    clientOptions: FieldOption[];
    onCreateClient: (name: string) => void;
};

export type CrediarioSectionProps = {
    form: SaleFormState;
    onEditClient: () => void;
};

export type TotalsSectionProps = {
    form: SaleFormState;
    onOpenDiscount: () => void;
};

export type DiscountDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subtotal: number;
    applied: AppliedDiscount;
    onApply: (discount: AppliedDiscount) => void;
};

export type AddProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: UiProduct | null;
    onConfirm: (product: UiProduct, quantity: number, price: number) => void;
};

export type SaleConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: SaleDraft;
    isSubmitting: boolean;
    onConfirm: (draft: SaleDraft) => void;
};

export type StockWarningDialogProps = {
    warning: StockWarning | null;
    isSubmitting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export type PrintPreviewMode = 'digital' | 'thermal';

export type PrintPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale | null;
    initialMode?: PrintPreviewMode;
};

export type SaleStatusChipProps = {
    status: SaleStatus;
};

export type SaleDetailsProps = {
    sale: Sale;
};

export type SaleItemsProps = {
    sale: Sale;
};

export type SaleInstallmentsProps = {
    receivables: AccountReceivable[];
};

export type NewClientData = NonNullable<ClientCreateDialogProps['initialData']>;

export type NamesCellProps = {
    names: string[];
};
