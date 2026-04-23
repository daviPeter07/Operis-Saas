import { EmptyState } from '../empty-state';
import { Truck } from 'lucide-react';

interface SuppliersModuleProps {
    onAddSupplier?: () => void;
}

export function SuppliersModule({ onAddSupplier }: SuppliersModuleProps) {
    return (
        <EmptyState
            icon={Truck}
            title="Nenhum fornecedor ainda"
            description="Comece adicionando seu primeiro fornecedor para gerenciar compras."
            action={
                onAddSupplier
                    ? { label: 'Adicionar Fornecedor', onClick: onAddSupplier }
                    : undefined
            }
        />
    );
}