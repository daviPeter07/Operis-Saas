import { EmptyState } from '../empty-state';
import { Package } from 'lucide-react';

interface ProductsModuleProps {
    onAddProduct?: () => void;
}

export function ProductsModule({ onAddProduct }: ProductsModuleProps) {
    return (
        <EmptyState
            icon={Package}
            title="Nenhum produto ainda"
            description="Comece adicionando seu primeiro produto para gerenciar estoque."
            action={
                onAddProduct
                    ? { label: 'Adicionar Produto', onClick: onAddProduct }
                    : undefined
            }
        />
    );
}
