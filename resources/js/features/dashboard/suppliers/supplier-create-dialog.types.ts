import type { Supplier } from '@/lib/mocks/mock-data';

export type SupplierCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Supplier) => void;
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
