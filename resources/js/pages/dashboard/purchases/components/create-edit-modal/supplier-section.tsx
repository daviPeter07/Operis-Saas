import { Truck, UserPlus } from 'lucide-react';
import { InputSearchComplete } from '@/components/input-search-complete';
import { Button } from '@/components/ui/button';
import type { SupplierSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function SupplierSection({
    form,
    supplierOptions,
    onCreateSupplier,
}: SupplierSectionProps) {
    return (
        <StepSection
            icon={Truck}
            title="Fornecedor"
            description="De quem você está comprando"
            action={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onCreateSupplier('')}
                >
                    <UserPlus className="size-4" />
                    <span className="hidden sm:inline">Novo fornecedor</span>
                    <span className="sr-only sm:hidden">Novo fornecedor</span>
                </Button>
            }
        >
            <InputSearchComplete
                value={form.supplierId}
                onChange={form.setSupplierId}
                options={supplierOptions}
                ariaLabel="Fornecedor da compra"
                placeholder="Buscar fornecedor pelo nome"
                emptyMessage="Nenhum fornecedor encontrado."
                onCreateOption={onCreateSupplier}
                createOptionLabel={(query) => `Cadastrar "${query}"`}
            />
        </StepSection>
    );
}
