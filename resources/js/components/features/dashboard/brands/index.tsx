import { EmptyState } from '../empty-state';
import { Award } from 'lucide-react';

interface BrandsModuleProps {
    onAddBrand?: () => void;
}

export function BrandsModule({ onAddBrand }: BrandsModuleProps) {
    return (
        <EmptyState
            icon={Award}
            title="Nenhuma marca ainda"
            description="Comece adicionando sua primeira marca para organizar produtos."
            action={
                onAddBrand
                    ? { label: 'Adicionar Marca', onClick: onAddBrand }
                    : undefined
            }
        />
    );
}
