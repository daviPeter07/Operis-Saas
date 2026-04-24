import { Filter } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageFiltersProps {
    children: ReactNode;
}

export function PageFilters({ children }: PageFiltersProps) {
    return (
        <div className="flex items-center gap-3 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex-1" />
            {children}
        </div>
    );
}
