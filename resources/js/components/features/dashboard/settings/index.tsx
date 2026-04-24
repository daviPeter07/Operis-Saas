import { EmptyState } from '../empty-state';
import { Settings } from 'lucide-react';
import { useWorkspace } from '@/components/features/dashboard/workspace-context';

interface SettingsModuleProps {}

export function SettingsModule() {
    const { canAccessSettings } = useWorkspace();

    if (! canAccessSettings) {
        return (
            <EmptyState
                icon={Settings}
                title="Configurações restritas"
                description="Apenas administradores podem acessar configurações e personalizações da empresa."
            />
        );
    }

    return (
        <EmptyState
            icon={Settings}
            title="Nenhuma configuração ainda"
            description="As configurações aparecerão aqui."
        />
    );
}
