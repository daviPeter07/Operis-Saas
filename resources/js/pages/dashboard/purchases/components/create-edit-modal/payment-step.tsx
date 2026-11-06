import { CalendarDays } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentStepProps } from '../../utils/types';
import { BoletoSection } from './boleto-section';
import { PaymentSection } from './payment-section';
import { PurchaseDateField } from './purchase-date-field';
import { StepCard } from './step-card';
import { StepSection } from './step-section';
import { TotalsSection } from './totals-section';

export function PaymentStep({ form }: PaymentStepProps) {
    return (
        <StepCard>
            <PaymentSection form={form} />

            {form.paymentMethod === 'boleto' ? (
                <BoletoSection form={form} />
            ) : null}

            <StepSection
                icon={CalendarDays}
                title="Data e observações"
                description="Quando a compra aconteceu e algum recado"
            >
                <div className="grid items-start gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <PurchaseDateField form={form} />
                    <div className="space-y-2">
                        <Label htmlFor="purchase-notes">Observações</Label>
                        <Textarea
                            id="purchase-notes"
                            value={form.notes}
                            onChange={(event) =>
                                form.setNotes(event.currentTarget.value)
                            }
                            placeholder="Opcional. Ex.: nota fiscal 1234"
                            aria-invalid={form.notesError !== null}
                            rows={3}
                            className="h-24 resize-none"
                        />
                        {form.notesError ? (
                            <p className="text-xs text-destructive">
                                {form.notesError}
                            </p>
                        ) : null}
                    </div>
                </div>
            </StepSection>

            <TotalsSection form={form} />
        </StepCard>
    );
}
