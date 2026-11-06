import { CardPaymentFields } from '@/components/payment/card-payment-fields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CHECKOUT_PAYMENT_OPTIONS } from '../../utils/constants';
import { isUiPaymentMethod } from '../../utils/functions';
import type { CheckoutSectionProps } from '../../utils/types';

export function PaymentSection({ form }: CheckoutSectionProps) {
    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                        Forma de pagamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ToggleGroup
                        type="single"
                        value={form.paymentMethod}
                        onValueChange={(value) => {
                            if (isUiPaymentMethod(value)) {
                                form.setPaymentMethod(value);
                            }
                        }}
                        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                    >
                        {CHECKOUT_PAYMENT_OPTIONS.map((option) => (
                            <ToggleGroupItem
                                key={option.value}
                                value={option.value}
                                variant="outline"
                                className="rounded-md border"
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </CardContent>
            </Card>

            {form.paymentMethod === 'card' ? (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                            Detalhes do cartão
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardPaymentFields
                            cardType={form.cardType}
                            onCardTypeChange={form.setCardType}
                            installments={form.installments}
                            onInstallmentsChange={form.setInstallments}
                            firstInstallmentDate={form.firstInstallmentDate}
                            onFirstInstallmentDateChange={
                                form.setFirstInstallmentDate
                            }
                            totalAmount={form.total}
                            showCardTypeToggle
                            enableInstallments={false}
                        />
                    </CardContent>
                </Card>
            ) : null}
        </>
    );
}
