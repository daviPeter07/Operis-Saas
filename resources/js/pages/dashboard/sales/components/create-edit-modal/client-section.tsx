import { UserPlus, UserRound } from 'lucide-react';
import { InputSearchComplete } from '@/components/input-search-complete';
import { Button } from '@/components/ui/button';
import type { ClientSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function ClientSection({
    form,
    clientOptions,
    onCreateClient,
}: ClientSectionProps) {
    return (
        <StepSection
            icon={UserRound}
            title="Cliente"
            description="Quem está comprando"
            action={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onCreateClient('')}
                >
                    <UserPlus className="size-4" />
                    <span className="hidden sm:inline">Novo cliente</span>
                    <span className="sr-only sm:hidden">Novo cliente</span>
                </Button>
            }
        >
            <InputSearchComplete
                value={form.clientId}
                onChange={form.setClientId}
                options={clientOptions}
                ariaLabel="Cliente da venda"
                placeholder="Buscar cliente pelo nome"
                emptyMessage="Nenhum cliente encontrado."
                onCreateOption={onCreateClient}
                createOptionLabel={(query) => `Cadastrar "${query}"`}
            />
        </StepSection>
    );
}
