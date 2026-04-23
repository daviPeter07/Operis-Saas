import { EmptyState } from '../empty-state';
import { UsersRound } from 'lucide-react';

interface TeamModuleProps {
    onAddMember?: () => void;
}

export function TeamModule({ onAddMember }: TeamModuleProps) {
    return (
        <EmptyState
            icon={UsersRound}
            title="Nenhum membro ainda"
            description="Comece adicionando seu primeiro membro para colaborar."
            action={
                onAddMember
                    ? { label: 'Adicionar Membro', onClick: onAddMember }
                    : undefined
            }
        />
    );
}