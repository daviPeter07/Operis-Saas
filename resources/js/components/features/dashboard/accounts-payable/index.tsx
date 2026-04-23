import { EmptyState } from '../empty-state';
import { Receipt } from 'lucide-react';

interface AccountsPayableModuleProps {
    onAddBill?: () => void;
}

export function AccountsPayableModule({ onAddBill }: AccountsPayableModuleProps) {
    return (
        <EmptyState
            icon={Receipt}
            title="No payables yet"
            description="Start by adding your first bill to track expenses."
            action={
                onAddBill
                    ? { label: 'Add Bill', onClick: onAddBill }
                    : undefined
            }
        />
    );
}