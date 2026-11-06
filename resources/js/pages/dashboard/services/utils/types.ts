import type { z } from 'zod';
import type { Service } from '@/schemas/service';
import type { serviceFormSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type ServiceRow = {
    id: string;
    service: Service;
    name: string;
    description: string;
    price: number;
    cost: number | null;
    performedCount: number;
    salesUrl: string;
    status: Service['status'];
};

export type ServiceForm = z.infer<typeof serviceFormSchema>;

export type ServiceModalMode = 'create' | 'edit';

export type ServiceModalText = {
    title: string;
    description: string;
    submit: string;
    success: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service?: Service | null;
    /** Name typed in the sale catalog search, to prefill "Novo serviço". */
    initialName?: string;
    onCreated?: (service: Service) => void;
};
