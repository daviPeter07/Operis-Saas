import { EmptyState } from '../empty-state';
import { CreditCard } from 'lucide-react';

interface AccountsReceivableModuleProps {
    onAddInvoice?: () => void;
}

export function AccountsReceivableModule({ onAddInvoice }: AccountsReceivableModuleProps) {
    return (
        <EmptyState
            icon={CreditCard}
            title="No receivables yet"
            description="Start by adding your first invoice to track payments."
            action={
                onAddInvoice
                    ? { label: 'Add Invoice', onClick: onAddInvoice }
                    : undefined
            }
        />
    );
}