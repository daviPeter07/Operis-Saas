import type { Client, Product } from '@/lib/mocks/mock-data';
import type { SalesRecord } from '@/types/sales-dialog';

export interface SalesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (sale: SalesRecord) => void;
    clients: Client[];
    products: Product[];
    onCreateClient: (client: Client) => Client;
    onCreateProduct: (product: Product) => Product;
    defaultTab?: 'catalog' | 'checkout';
}
