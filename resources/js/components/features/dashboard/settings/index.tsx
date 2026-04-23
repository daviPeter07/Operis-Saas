import { EmptyState } from '../empty-state';
import { Settings } from 'lucide-react';

interface SettingsModuleProps {}

export function SettingsModule() {
    return (
        <EmptyState
            icon={Settings}
            title="Nenhuma configuração ainda"
            description="As configurações aparecerão aqui."
        />
    );
}
