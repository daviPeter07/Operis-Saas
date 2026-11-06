import type { z } from 'zod';
import type { Supplier } from '@/schemas/supplier';
import type { supplierFormSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type PersonType = Supplier['person_type'];

export type SupplierRow = {
    id: string;
    supplier: Supplier;
    name: string;
    document: string;
    person_type: PersonType;
    email: string;
    phone: string;
    status: Supplier['status'];
    createdAt: string;
};

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export type SupplierSubmitData = {
    name: string;
    person_type: PersonType;
    email: string;
    phone: string;
    document: string;
};

export type SupplierDialogMode = 'create' | 'edit';

export type SupplierDialogText = {
    title: string;
    description: string;
    submit: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (supplier: Supplier) => void;
    supplier?: Supplier | null;
    // Name typed in a search box, used to start a new supplier.
    initialName?: string;
};

export type SupplierDetailsProps = {
    supplier: Supplier;
};

export type SuppliersShowPageProps = {
    supplierId: number;
};
