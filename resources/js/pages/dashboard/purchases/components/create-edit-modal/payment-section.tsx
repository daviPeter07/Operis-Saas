import { Wallet } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CHECKOUT_PAYMENT_OPTIONS } from '../../utils/constants';
import { isUiPaymentMethod } from '../../utils/functions';
import type { CheckoutSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function PaymentSection({ form }: CheckoutSectionProps) {
    return (
        <StepSection
            icon={Wallet}
            title="Forma de pagamento"
            description="Como você vai pagar o fornecedor"
        >
            <ToggleGroup
                type="single"
                value={form.paymentMethod}
                onValueChange={(value) => {
                    if (isUiPaymentMethod(value)) {
                        form.setPaymentMethod(value);
                    }
                }}
                className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
            >
                {CHECKOUT_PAYMENT_OPTIONS.map(
                    ({ value, label, hint, icon: Icon }) => (
                        <ToggleGroupItem
                            key={value}
                            value={value}
                            variant="outline"
                            className="flex h-auto flex-col items-center gap-1 rounded-xl border px-2 py-3"
                        >
                            <Icon aria-hidden className="size-5" />
                            <span className="text-sm font-semibold">
                                {label}
                            </span>
                            <span className="text-[11px] font-normal opacity-75">
                                {hint}
                            </span>
                        </ToggleGroupItem>
                    ),
                )}
            </ToggleGroup>

            {form.paymentMethod === 'money' ? (
                <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                    Compra em dinheiro é paga na hora: ela já entra como paga em
                    contas a pagar.
                </p>
            ) : null}
        </StepSection>
    );
}
