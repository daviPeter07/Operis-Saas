import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';
import type { Brand } from '@/schemas/brand';
import type { Category } from '@/schemas/category';
import type { Product } from '@/schemas/product';
import type { FieldOption } from '@/utils/form-fields';
import type { productFormSchema, quickCreateSchema } from './schemas';

export type ApiParams = Record<string, string>;

export type ProductRow = {
    id: string;
    product: Product;
    name: string;
    sku: string;
    barcode: string | null;
    cost: number;
    sale_price: number;
    stock: number;
    min_stock: number;
    categoryName: string;
    brandName: string;
};

export type InventoryFilterOptions = {
    brands: FieldOption[];
    categories: FieldOption[];
};

export type InventoryTotals = {
    costValue: number;
    saleValue: number;
    quantity: number;
};

export type SummaryCard = {
    key: keyof InventoryTotals;
    label: string;
    icon: LucideIcon;
    format: (value: number) => string;
};

export type UnitProfit = {
    profit: number;
    margin: number;
};

export type CreateEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
};

export type ProductDetailsProps = {
    product: Product;
    brandName: string;
    categoryName: string;
};

export type InventoryShowPageProps = {
    productId: number;
};

export type ProductDialogMode = 'create' | 'edit';

export type QuickCreateType = 'brand' | 'category';

export type ProductDialogForm = z.infer<typeof productFormSchema>;

export type QuickCreateForm = z.infer<typeof quickCreateSchema>;

export type ProductDialogSubmitData = {
    id?: number;
    name: string;
    sku: string;
    barcode: string | null;
    description: string | null;
    sale_price: number;
    cost: number;
    stock: number;
    min_stock: number;
    category_id: number;
    brand_id: number | null;
};

export type ProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: ProductDialogMode;
    initialData?: Partial<ProductDialogForm>;
    brands: FieldOption[];
    categories: FieldOption[];
    onCreateBrand: (name: string) => Promise<Brand>;
    onCreateCategory: (name: string) => Promise<Category>;
    onSubmit: (data: ProductDialogSubmitData) => Promise<void>;
};

export type ProductDialogText = {
    title: string;
    description: string;
    submit: string;
};

export type QuickCreateText = {
    title: string;
    description: string;
    placeholder: string;
    submit: string;
    success: string;
    error: string;
};

export type IdentificationFieldsProps = {
    brands: FieldOption[];
    categories: FieldOption[];
    onQuickCreate: (type: QuickCreateType, name?: string) => void;
};

export type StockFieldProps = {
    name: 'stock' | 'min_stock';
    label: string;
};

export type QuickCreateDialogProps = {
    type: QuickCreateType | null;
    initialName: string;
    onClose: () => void;
    onCreate: (type: QuickCreateType, name: string) => Promise<void>;
};

export type QuickCreateButtonProps = {
    label: string;
    onClick: () => void;
};

export type QuickCreateState = {
    type: QuickCreateType | null;
    name: string;
};

export type ServerValidationError = {
    message?: string;
    errors?: Record<string, string[]>;
};
