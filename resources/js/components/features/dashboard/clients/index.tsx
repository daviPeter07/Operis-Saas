import { EmptyState } from '../empty-state';
import { Users } from 'lucide-react';

interface ClientsModuleProps {
    onAddClient?: () => void;
}

export function ClientsModule({ onAddClient }: ClientsModuleProps) {
    return (
        <EmptyState
            icon={Users}
            title="No clients yet"
            description="Start by adding your first client to manage relationships."
            action={
                onAddClient
                    ? { label: 'Add Client', onClick: onAddClient }
                    : undefined
            }
        />
    );
}