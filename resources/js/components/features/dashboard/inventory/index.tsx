import { EmptyState } from '../empty-state';
import { Warehouse } from 'lucide-react';

interface InventoryModuleProps {
    onAdjustInventory?: () => void;
}

export function InventoryModule({ onAdjustInventory }: InventoryModuleProps) {
    return (
        <EmptyState
            icon={Warehouse}
            title="Nenhum estoque ainda"
            description="Comece adicionando estoque para acompanhar níveis."
            action={
                onAdjustInventory
                    ? { label: 'Adicionar Estoque', onClick: onAdjustInventory }
                    : undefined
            }
        />
    );
}
