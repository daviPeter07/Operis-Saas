import type { CartStepProps } from '../../utils/types';
import { CartSection } from './cart-section';
import { ClientSection } from './client-section';
import { TotalsSection } from './totals-section';

export function CartStep({
    form,
    clientOptions,
    onCreateClient,
    onOpenDiscount,
}: CartStepProps) {
    return (
        <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
                <ClientSection
                    form={form}
                    clientOptions={clientOptions}
                    onCreateClient={onCreateClient}
                />
                <CartSection form={form} />
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
                <TotalsSection form={form} onOpenDiscount={onOpenDiscount} />
            </div>
        </div>
    );
}
