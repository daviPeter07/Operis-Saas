import { EmptyState } from '../empty-state';
import { BarChart3 } from 'lucide-react';

interface ReportsModuleProps {}

export function ReportsModule() {
    return (
        <EmptyState
            icon={BarChart3}
            title="No reports yet"
            description="Reports and analytics will appear here."
        />
    );
}