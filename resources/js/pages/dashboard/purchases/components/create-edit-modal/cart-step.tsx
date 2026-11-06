import type { CartStepProps } from '../../utils/types';
import { CartSection } from './cart-section';
import { StepCard } from './step-card';
import { SupplierSection } from './supplier-section';
import { TotalsSection } from './totals-section';

export function CartStep({
    form,
    supplierOptions,
    onCreateSupplier,
}: CartStepProps) {
    return (
        <StepCard>
            <SupplierSection
                form={form}
                supplierOptions={supplierOptions}
                onCreateSupplier={onCreateSupplier}
            />
            <CartSection form={form} />
            <TotalsSection form={form} />
        </StepCard>
    );
}
