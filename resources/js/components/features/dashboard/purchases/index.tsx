import { EmptyState } from '../empty-state';
import { ShoppingCart } from 'lucide-react';

interface PurchasesModuleProps {
    onAddPurchase?: () => void;
}

export function PurchasesModule({ onAddPurchase }: PurchasesModuleProps) {
    return (
        <EmptyState
            icon={ShoppingCart}
            title="No purchases yet"
            description="Start by adding your first purchase to track expenses."
            action={
                onAddPurchase
                    ? { label: 'Add Purchase', onClick: onAddPurchase }
                    : undefined
            }
        />
    );
}