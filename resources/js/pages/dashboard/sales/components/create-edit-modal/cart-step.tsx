import type { CartStepProps } from '../../utils/types';
import { CartSection } from './cart-section';
import { ClientSection } from './client-section';
import { StepCard } from './step-card';
import { TotalsSection } from './totals-section';

export function CartStep({
    form,
    clientOptions,
    onCreateClient,
    onOpenDiscount,
}: CartStepProps) {
    return (
        <StepCard>
            <ClientSection
                form={form}
                clientOptions={clientOptions}
                onCreateClient={onCreateClient}
            />
            <CartSection form={form} />
            <TotalsSection form={form} onOpenDiscount={onOpenDiscount} />
        </StepCard>
    );
}
