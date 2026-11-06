import { Button } from '@/components/ui/button';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { CheckoutPanelProps } from '../../utils/types';
import { CartSection } from './cart-section';
import { ClientSection } from './client-section';
import { CrediarioSection } from './crediario-section';
import { PaymentSection } from './payment-section';
import { SaleDateField } from './sale-date-field';
import { TotalsSection } from './totals-section';

export function CheckoutPanel({
    form,
    title,
    description,
    clientOptions,
    onCreateClient,
    onEditClient,
    onOpenDiscount,
    onSubmit,
}: CheckoutPanelProps) {
    const isMissingBasics = !form.selectedClient || form.lineItems.length === 0;

    return (
        <section className="flex min-h-0 flex-col bg-card">
            <div className="border-b p-4">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-lg">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <ClientSection
                        form={form}
                        clientOptions={clientOptions}
                        onCreateClient={onCreateClient}
                    />

                    <CartSection form={form} />

                    <PaymentSection form={form} />

                    {form.paymentMethod === 'crediario' ? (
                        <CrediarioSection
                            form={form}
                            onEditClient={onEditClient}
                        />
                    ) : null}

                    <TotalsSection
                        form={form}
                        onOpenDiscount={onOpenDiscount}
                    />

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

                    <SaleDateField form={form} />

                    <div className="space-y-2">
                        <Button
                            type="button"
                            className="w-full"
                            size="lg"
                            disabled={!form.canSubmit}
                            onClick={onSubmit}
                        >
                            Próximo
                        </Button>
                        {isMissingBasics ? (
                            <p className="text-center text-xs text-muted-foreground">
                                Escolha o cliente e adicione ao menos um item
                                para continuar.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
