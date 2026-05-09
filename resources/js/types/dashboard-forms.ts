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
    status: 'active' | 'inactive';
    creditEnabled: 'yes' | 'no';
    creditLimit: string;
    creditTermDays: string;
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
    initialData?: {
        id?: number;
        name: string;
        email: string;
        phone: string;
        document: string;
        personType: ClientPersonType;
        creditEnabled: boolean;
        creditLimit: number;
        creditTermDays: number;
        status?: 'active' | 'inactive';
    };
};

export type FinancialEntryForm = {
    supplierName: string;
    items: string;
    total: string;
    paymentMethod: string;
    boletoTermDays: string;
    cardType: 'debit' | 'credit';
    installments: string;
    firstInstallmentDate: string;
    status: string;
    createdAt: string;
};

export type PurchaseLineItem = {
    productId: string;
    quantity: number;
    unitCost: number;
    productName?: string;
};

export type PurchaseCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UiPurchase) => void;
    products: UiProduct[];
    suppliers: UiSupplier[];
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    onCreateSupplier: (data: UiSupplier) => Promise<UiSupplier>;
    onCreateProduct: (data: {
        name: string;
        sku: string;
        barcode: string;
        categoryId: number;
        brandId: number | null;
        cost: number;
        price: number;
        stock: number;
        minStock: number;
        createdAt: string;
    }) => Promise<UiProduct>;
    onApplyStock: (items: PurchaseLineItem[]) => void;
};

export type AccountsPayableCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UiPurchase) => void;
    suppliers: UiSupplier[];
    onCreateSupplier: (data: UiSupplier) => Promise<UiSupplier>;
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
