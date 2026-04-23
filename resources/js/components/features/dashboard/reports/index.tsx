import { EmptyState } from '../empty-state';
import { BarChart3 } from 'lucide-react';

interface ReportsModuleProps {}

export function ReportsModule() {
    return (
        <EmptyState
            icon={BarChart3}
            title="Nenhum relatório ainda"
            description="Relatórios e análises aparecerão aqui."
        />
    );
}