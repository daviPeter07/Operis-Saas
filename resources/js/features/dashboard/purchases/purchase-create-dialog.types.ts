import type { Purchase } from '@/lib/mocks/mock-data';

export type PurchaseCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Purchase) => void;
};

export type PurchaseForm = {
    supplierName: string;
    items: string;
    total: string;
    paymentMethod: string;
    status: string;
    dueDate: string;
    createdAt: string;
};
