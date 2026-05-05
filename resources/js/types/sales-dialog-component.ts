import type { UiCustomer, UiProduct } from '@/types/dashboard-entities';
import type { SalesRecord } from '@/types/sales-dialog';

export interface SalesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (sale: SalesRecord) => void;
    clients: UiCustomer[];
    products: UiProduct[];
    onCreateClient: (client: UiCustomer) => UiCustomer;
    onCreateProduct: (product: UiProduct) => UiProduct;
    defaultTab?: 'catalog' | 'checkout';
}
