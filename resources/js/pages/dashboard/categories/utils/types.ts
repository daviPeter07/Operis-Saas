import type { z } from 'zod';
import type { Category } from '@/schemas/category';
import type { categoryFormSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type CategoryRow = {
    id: string;
    category: Category;
    name: string;
    status: Category['status'];
};

export type CategoryForm = z.infer<typeof categoryFormSchema>;

export type CategoryModalMode = 'create' | 'edit';

export type CategoryModalText = {
    title: string;
    description: string;
    submit: string;
    success: string;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
};
