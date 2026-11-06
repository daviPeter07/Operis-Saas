import { Textarea } from '@/components/ui/textarea';
import type { PaymentStepProps } from '../../utils/types';
import { CrediarioSection } from './crediario-section';
import { PaymentSection } from './payment-section';
import { SaleDateField } from './sale-date-field';
import { TotalsSection } from './totals-section';

export function PaymentStep({ form, onEditClient }: PaymentStepProps) {
    return (
        <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
                <PaymentSection form={form} />

                {form.paymentMethod === 'crediario' ? (
                    <CrediarioSection form={form} onEditClient={onEditClient} />
                ) : null}

                <SaleDateField form={form} />

                <div className="space-y-1.5">
                    <Textarea
                        value={form.notes}
                        onChange={(event) =>
                            form.setNotes(event.currentTarget.value)
                        }
                        placeholder="Observações (opcional)"
                        aria-label="Observações"
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
            <div className="lg:sticky lg:top-4 lg:self-start">
                <TotalsSection form={form} />
            </div>
        </div>
    );
}
