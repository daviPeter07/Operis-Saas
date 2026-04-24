import { EmptyState } from '../empty-state';
import { TrendingUp } from 'lucide-react';

interface SalesModuleProps {
    onAddSale?: () => void;
}

export function SalesModule({ onAddSale }: SalesModuleProps) {
    return (
        <EmptyState
            icon={TrendingUp}
            title="Nenhuma venda ainda"
            description="Comece adicionando sua primeira venda para acompanhar a receita."
            action={
                onAddSale
                    ? { label: 'Adicionar Venda', onClick: onAddSale }
                    : undefined
            }
        />
    );
}
