import { EmptyState } from '../empty-state';
import { Package } from 'lucide-react';

interface ProductsModuleProps {
    onAddProduct?: () => void;
}

export function ProductsModule({ onAddProduct }: ProductsModuleProps) {
    return (
        <EmptyState
            icon={Package}
            title="No products yet"
            description="Start by adding your first product to manage inventory."
            action={
                onAddProduct
                    ? { label: 'Add Product', onClick: onAddProduct }
                    : undefined
            }
        />
    );
}