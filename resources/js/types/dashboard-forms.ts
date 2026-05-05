import type {
    UiCustomer,
    UiProduct,
    UiPurchase,
    UiSupplier,
} from '@/types/dashboard-entities';

export type ClientPersonType = 'pf' | 'pj';

export type ClientForm = {
    name: string;
    personType: ClientPersonType;
    email: string;
    phone: string;
    document: string;
    state: string;
    city: string;
    street: string;
    neighborhood: string;
    number: string;
    zipCode: string;
};

export type ClientCreateDialogPayload = UiCustomer & {
    personType: ClientPersonType;
};

export type ClientCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (client: { id: number; name: string }) => void;
};

export type FinancialEntryForm = {
    supplierName: string;
    items: string;
    total: string;
    paymentMethod: string;
    cardType: 'debit' | 'credit';
    installments: string;
    firstInstallmentDate: string;
    status: string;
    createdAt: string;
};

export type PurchaseLineItem = {
    productId: string;
    quantity: number;
};

export type PurchaseCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UiPurchase) => void;
    products: UiProduct[];
    suppliers: UiSupplier[];
    onCreateSupplier: (data: UiSupplier) => UiSupplier;
    onApplyStock: (items: PurchaseLineItem[]) => void;
};

export type AccountsPayableCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UiPurchase) => void;
    suppliers: UiSupplier[];
    onCreateSupplier: (data: UiSupplier) => UiSupplier;
};

export type SupplierForm = {
    name: string;
    personType: 'pf' | 'pj';
    email: string;
    phone: string;
    document: string;
    state: string;
    city: string;
    street: string;
    neighborhood: string;
    number: string;
    zipCode: string;
};

export type SupplierCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};
