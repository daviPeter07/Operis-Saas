import { EmptyState } from '../empty-state';
import { TrendingUp } from 'lucide-react';

interface SalesModuleProps {
    onAddSale?: () => void;
}

export function SalesModule({ onAddSale }: SalesModuleProps) {
    return (
        <EmptyState
            icon={TrendingUp}
            title="No sales yet"
            description="Start by adding your first sale to track revenue."
            action={
                onAddSale
                    ? { label: 'Add Sale', onClick: onAddSale }
                    : undefined
            }
        />
    );
}
