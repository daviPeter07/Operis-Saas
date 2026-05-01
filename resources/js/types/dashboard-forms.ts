import type { Product, Purchase, Supplier } from '@/lib/mocks/mock-data';

export type FinancialEntryForm = {
    supplierName: string;
    items: string;
    total: string;
    paymentMethod: string;
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
    onSubmit: (data: Purchase) => void;
    products: Product[];
    onApplyStock: (items: PurchaseLineItem[]) => void;
};

export type AccountsPayableCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Purchase) => void;
};

export type SupplierForm = {
    name: string;
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
    onSubmit: (data: Supplier) => void;
};
