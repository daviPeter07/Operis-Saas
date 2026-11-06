import type { z } from 'zod';
import type { Brand } from '@/schemas/brand';
import type { brandFormSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type BrandRow = {
    id: string;
    brand: Brand;
    name: string;
    status: Brand['status'];
    productsCount: number;
    productsUrl: string;
};

export type BrandForm = z.infer<typeof brandFormSchema>;

export type BrandModalMode = 'create' | 'edit';

export type BrandModalText = {
    title: string;
    description: string;
    submit: string;
    success: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand?: Brand | null;
};
