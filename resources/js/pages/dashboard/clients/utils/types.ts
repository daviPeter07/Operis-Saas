import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { Customer } from '@/schemas/customer';
import type {
    ClientCreateDialogProps,
    ClientPersonType,
} from '@/types/dashboard-forms';
import type { clientFormSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type ClientRow = {
    id: string;
    customer: Customer;
    name: string;
    personType: ClientPersonType;
    document: string;
    email: string;
    phone: string;
    creditEnabled: boolean;
    creditLimit: number;
    availableCredit: number;
    creditTermDays: number;
    status: Customer['status'];
    createdAt: string | null;
};

export type ClientCredit = {
    limit: number;
    openBalance: number;
    available: number;
};

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export type ClientInitialData = NonNullable<
    ClientCreateDialogProps['initialData']
>;

export type ClientSubmitData = {
    name: string;
    email: string;
    phone: string;
    document: string;
    person_type: ClientPersonType;
    status: Customer['status'];
    credit_enabled: boolean;
    credit_limit: number;
    credit_term_days: number;
};

export type ClientDialogMode = 'create' | 'edit';

export type ClientDialogText = {
    title: string;
    description: string;
    submit: string;
    submitting: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null;
};

export type SavedClient = { id: number; name: string };

export type ClientFormProps = {
    initialData?: ClientInitialData;
    text: ClientDialogText;
    onCancel: () => void;
    onSaved: (client: SavedClient) => void;
};

export type CreditFieldTooltipProps = {
    disabled: boolean;
    children: ReactNode;
};

export type ClientDetailsProps = {
    customer: Customer;
};

export type ClientsShowPageProps = {
    customerId: number;
};
