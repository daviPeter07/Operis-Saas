import { EmptyState } from '../empty-state';
import { Award } from 'lucide-react';

interface BrandsModuleProps {
    onAddBrand?: () => void;
}

export function BrandsModule({ onAddBrand }: BrandsModuleProps) {
    return (
        <EmptyState
            icon={Award}
            title="No brands yet"
            description="Start by adding your first brand to organize products."
            action={
                onAddBrand
                    ? { label: 'Add Brand', onClick: onAddBrand }
                    : undefined
            }
        />
    );
}