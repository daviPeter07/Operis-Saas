import { EmptyState } from '../empty-state';
import { Tags } from 'lucide-react';

interface CategoriesModuleProps {
    onAddCategory?: () => void;
}

export function CategoriesModule({ onAddCategory }: CategoriesModuleProps) {
    return (
        <EmptyState
            icon={Tags}
            title="Nenhuma categoria ainda"
            description="Comece adicionando sua primeira categoria para organizar produtos."
            action={
                onAddCategory
                    ? { label: 'Adicionar Categoria', onClick: onAddCategory }
                    : undefined
            }
        />
    );
}
