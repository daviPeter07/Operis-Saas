import { EmptyState } from '../empty-state';
import { Truck } from 'lucide-react';

interface SuppliersModuleProps {
    onAddSupplier?: () => void;
}

export function SuppliersModule({ onAddSupplier }: SuppliersModuleProps) {
    return (
        <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Start by adding your first supplier to manage procurement."
            action={
                onAddSupplier
                    ? { label: 'Add Supplier', onClick: onAddSupplier }
                    : undefined
            }
        />
    );
}