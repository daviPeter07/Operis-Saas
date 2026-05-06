import type { Brand } from '@/schemas/brand';
import type { Category } from '@/schemas/category';
import type { UiCustomer, UiProduct } from '@/types/dashboard-entities';
import type { SalesRecord } from '@/types/sales-dialog';

export interface SalesDialogProps {
    sale?: SalesRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (sale: SalesRecord) => void;
    clients: UiCustomer[];
    products: UiProduct[];
    brands: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string }>;
    onCreateProduct: (data: {
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
    }) => Promise<UiProduct>;
    onCreateBrand: (name: string) => Promise<Brand>;
    onCreateCategory: (name: string) => Promise<Category>;
    defaultTab?: 'catalog' | 'checkout';
}
