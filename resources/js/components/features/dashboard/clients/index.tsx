import { EmptyState } from '../empty-state';
import { Users } from 'lucide-react';

interface ClientsModuleProps {
    onAddClient?: () => void;
}

export function ClientsModule({ onAddClient }: ClientsModuleProps) {
    return (
        <EmptyState
            icon={Users}
            title="Nenhum cliente ainda"
            description="Comece adicionando seu primeiro cliente para gerenciar relacionamentos."
            action={
                onAddClient
                    ? { label: 'Adicionar Cliente', onClick: onAddClient }
                    : undefined
            }
        />
    );
}