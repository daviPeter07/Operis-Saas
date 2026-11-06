import { CalendarDays } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentStepProps } from '../../utils/types';
import { CrediarioSection } from './crediario-section';
import { PaymentSection } from './payment-section';
import { SaleDateField } from './sale-date-field';
import { StepCard } from './step-card';
import { StepSection } from './step-section';
import { TotalsSection } from './totals-section';

export function PaymentStep({ form, onEditClient }: PaymentStepProps) {
    return (
        <StepCard>
            <PaymentSection form={form} />

            {form.paymentMethod === 'crediario' ? (
                <CrediarioSection form={form} onEditClient={onEditClient} />
            ) : null}

            <StepSection
                icon={CalendarDays}
                title="Data e observações"
                description="Quando a venda aconteceu e algum recado"
            >
                <div className="grid items-start gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <SaleDateField form={form} />
                    <div className="space-y-2">
                        <Label htmlFor="sale-notes">Observações</Label>
                        <Textarea
                            id="sale-notes"
                            value={form.notes}
                            onChange={(event) =>
                                form.setNotes(event.currentTarget.value)
                            }
                            placeholder="Opcional. Ex.: entregar na loja do centro"
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
