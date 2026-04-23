import { EmptyState } from '../empty-state';
import { Tags } from 'lucide-react';

interface CategoriesModuleProps {
    onAddCategory?: () => void;
}

export function CategoriesModule({ onAddCategory }: CategoriesModuleProps) {
    return (
        <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Start by adding your first category to organize products."
            action={
                onAddCategory
                    ? { label: 'Add Category', onClick: onAddCategory }
                    : undefined
            }
        />
    );
}