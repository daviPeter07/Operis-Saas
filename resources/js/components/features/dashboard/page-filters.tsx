import { type ReactNode } from 'react';
import { Filter } from 'lucide-react';

interface PageFiltersProps {
    children: ReactNode;
}

export function PageFilters({ children }: PageFiltersProps) {
    return (
        <div className="flex items-center gap-3 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex-1" />
            {children}
        </div>
    );
}