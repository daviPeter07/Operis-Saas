import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PurchaseMutationInput } from '@/hooks/use-purchases';
import type { Purchase, PurchasePayable } from '@/schemas/purchase';
import type { Supplier } from '@/schemas/supplier';
import type { UiProduct } from '@/types/dashboard-entities';
import type { FieldOption } from '@/utils/form-fields';

export type ApiParams = Record<string, string>;

export type PurchaseStatus = Purchase['status'];

export type ApiPaymentMethod = PurchaseMutationInput['payment_method'];

export type UiPurchasePaymentMethod = 'money' | 'pix' | 'card' | 'boleto';

export type BoletoTerm = NonNullable<PurchaseMutationInput['boleto_term_days']>;

export type PurchaseRow = {
    id: string;
    purchase: Purchase;
    date: string;
    dueDate: string | null;
    supplierName: string;
    productNames: string[];
    categoryNames: string[];
    brandNames: string[];
    productList: string;
    categoryList: string;
    brandList: string;
    total: number;
    status: PurchaseStatus;
    paymentMethod: string;
    boletos: number;
};

export type PurchasesFilterOptions = {
    brands: FieldOption[];
    categories: FieldOption[];
};

export type PurchasesTotals = {
    count: number;
    total: number;
    payable: number;
};

export type SummaryCard = {
    key: keyof PurchasesTotals;
    label: string;
    icon: LucideIcon;
    format: (value: number) => string;
};

export type SummaryCardsProps = {
    apiParams: ApiParams;
};

export type PurchasesShowPageProps = {
    purchaseId: number;
};

export type PurchaseDialogMode = 'create' | 'edit';

export type PurchaseDialogText = {
    title: string;
    description: string;
    success: string;
    error: string;
};

export type PurchaseCartItem = {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
};

export type BoletoInstallment = {
    number: number;
    dueDate: string;
    amount: number;
};

export type BoletoOption = {
    term: BoletoTerm;
    count: number;
    lastDueDate: string;
};

export type PurchaseFormInitial = {
    supplierId: string;
    lineItems: PurchaseCartItem[];
    date: string;
    paymentMethod: UiPurchasePaymentMethod;
    boletoTerm: BoletoTerm;
    notes: string;
};

export type PurchaseFormState = {
    supplierId: string;
    setSupplierId: (value: string) => void;
    selectedSupplier: Supplier | undefined;
    lineItems: PurchaseCartItem[];
    addProduct: (product: UiProduct, quantity: number, cost: number) => void;
    increaseQuantity: (itemId: string) => void;
    decreaseQuantity: (itemId: string) => void;
    removeItem: (itemId: string) => void;
    productSearch: string;
    setProductSearch: (value: string) => void;
    isScannerReady: boolean;
    toggleScanner: () => void;
    paymentMethod: UiPurchasePaymentMethod;
    setPaymentMethod: (value: UiPurchasePaymentMethod) => void;
    boletoTerm: BoletoTerm;
    setBoletoTerm: (value: BoletoTerm) => void;
    boletos: BoletoInstallment[];
    purchaseDate: string;
    setPurchaseDate: (value: string) => void;
    notes: string;
    setNotes: (value: string) => void;
    notesError: string | null;
    total: number;
    canSubmit: boolean;
};

export type PurchaseDraft = {
    purchaseId?: number;
    supplierId: string;
    supplierName: string;
    date: string;
    lineItems: PurchaseCartItem[];
    paymentMethod: UiPurchasePaymentMethod;
    boletoTerm: BoletoTerm;
    boletos: BoletoInstallment[];
    total: number;
    status: 'pending' | 'completed';
    notes: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchase?: Purchase | null;
};

export type PurchaseFormProps = {
    title: string;
    description: string;
    initial: PurchaseFormInitial;
    purchaseId?: number;
    purchaseStatus?: PurchaseStatus;
    suppliers: Supplier[];
    products: UiProduct[];
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (draft: PurchaseDraft) => void;
};

export type CheckoutPaymentOption = {
    value: UiPurchasePaymentMethod;
    label: string;
    hint: string;
    icon: LucideIcon;
};

export type StepCardProps = {
    children: ReactNode;
};

export type StepSectionProps = {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
};

export type CheckoutSectionProps = {
    form: PurchaseFormState;
};

export type SupplierSectionProps = {
    form: PurchaseFormState;
    supplierOptions: FieldOption[];
    onCreateSupplier: (name: string) => void;
};

export type AddProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: UiProduct | null;
    onConfirm: (product: UiProduct, quantity: number, cost: number) => void;
};

export type PurchaseStatusChipProps = {
    status: PurchaseStatus;
};

export type PurchaseDetailsProps = {
    purchase: Purchase;
};

export type PurchaseItemsProps = {
    purchase: Purchase;
};

export type PurchasePayablesProps = {
    payables: PurchasePayable[];
};

export type NamesCellProps = {
    names: string[];
};

export type PurchaseStepKey = 'products' | 'cart' | 'payment' | 'summary';

export type PurchaseStep = {
    key: PurchaseStepKey;
    label: string;
    description: string;
};

export type PurchaseStepsProps = {
    current: number;
    reachable: number;
    onSelect: (index: number) => void;
};

export type AddedToCart = {
    id: number;
    productName: string;
    quantity: number;
};

export type CartAddedNoticeProps = {
    added: AddedToCart;
    itemCount: number;
    total: number;
    onViewCart: () => void;
    onDismiss: () => void;
};

export type ProductsStepProps = {
    form: PurchaseFormState;
    products: UiProduct[];
    lastAdded: AddedToCart | null;
    onAddFromCatalog: (product: UiProduct) => void;
    onOpenCreateProduct: () => void;
    onViewCart: () => void;
    onDismissAdded: () => void;
};

export type CartStepProps = {
    form: PurchaseFormState;
    supplierOptions: FieldOption[];
    onCreateSupplier: (name: string) => void;
};

export type PaymentStepProps = {
    form: PurchaseFormState;
};

export type PurchasePaymentAnswer = {
    value: PurchaseDraft['status'];
    label: string;
    description: string;
};

export type SummaryStepProps = {
    draft: PurchaseDraft;
    status: PurchaseDraft['status'];
    onStatusChange: (status: PurchaseDraft['status']) => void;
};

export type StepFooterProps = {
    step: number;
    canAdvance: boolean;
    isSubmitting: boolean;
    // Shown on the left when the step is complete (e.g. items and total).
    summary: ReactNode;
    onBack: () => void;
    onCancel: () => void;
    onNext: () => void;
    onConfirm: () => void;
};
