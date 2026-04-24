import { EmptyState } from '../empty-state';
import { CreditCard } from 'lucide-react';

interface AccountsReceivableModuleProps {
    onAddInvoice?: () => void;
}

export function AccountsReceivableModule({
    onAddInvoice,
}: AccountsReceivableModuleProps) {
    return (
        <EmptyState
            icon={CreditCard}
            title="Nenhuma conta a receber ainda"
            description="Comece adicionando sua primeira fatura para acompanhar pagamentos."
            action={
                onAddInvoice
                    ? { label: 'Adicionar Fatura', onClick: onAddInvoice }
                    : undefined
            }
        />
    );
}
