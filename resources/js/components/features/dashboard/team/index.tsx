import { EmptyState } from '../empty-state';
import { UsersRound } from 'lucide-react';

interface TeamModuleProps {
    onAddMember?: () => void;
}

export function TeamModule({ onAddMember }: TeamModuleProps) {
    return (
        <EmptyState
            icon={UsersRound}
            title="No team members yet"
            description="Start by adding your first team member to collaborate."
            action={
                onAddMember
                    ? { label: 'Add Member', onClick: onAddMember }
                    : undefined
            }
        />
    );
}