import type { Purchase } from '@/lib/mocks/mock-data';
import type { Product } from '@/lib/mocks/mock-data';

export type PurchaseCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Purchase) => void;
    products: Product[];
    onApplyStock: (items: PurchaseLineItem[]) => void;
};

export type PurchaseLineItem = {
    productId: string;
    quantity: number;
};

export type PurchaseForm = {
    supplierName: string;
    items: string;
    total: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
};
