import { EmptyState } from '../empty-state';
import { Warehouse } from 'lucide-react';

interface InventoryModuleProps {
    onAdjustInventory?: () => void;
}

export function InventoryModule({ onAdjustInventory }: InventoryModuleProps) {
    return (
        <EmptyState
            icon={Warehouse}
            title="No inventory yet"
            description="Start by adding inventory to track stock levels."
            action={
                onAdjustInventory
                    ? { label: 'Add Inventory', onClick: onAdjustInventory }
                    : undefined
            }
        />
    );
}