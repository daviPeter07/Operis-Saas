import { EmptyState } from '../empty-state';
import { ShoppingCart } from 'lucide-react';

interface PurchasesModuleProps {
    onAddPurchase?: () => void;
}

export function PurchasesModule({ onAddPurchase }: PurchasesModuleProps) {
    return (
        <EmptyState
            icon={ShoppingCart}
            title="Nenhuma compra ainda"
            description="Comece adicionando sua primeira compra para acompanhar despesas."
            action={
                onAddPurchase
                    ? { label: 'Adicionar Compra', onClick: onAddPurchase }
                    : undefined
            }
        />
    );
}