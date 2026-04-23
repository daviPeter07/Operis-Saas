import { EmptyState } from '../empty-state';
import { Receipt } from 'lucide-react';

interface AccountsPayableModuleProps {
    onAddBill?: () => void;
}

export function AccountsPayableModule({ onAddBill }: AccountsPayableModuleProps) {
    return (
        <EmptyState
            icon={Receipt}
            title="Nenhuma conta a pagar ainda"
            description="Comece adicionando sua primeira conta para acompanhar despesas."
            action={
                onAddBill
                    ? { label: 'Adicionar Conta', onClick: onAddBill }
                    : undefined
            }
        />
    );
}