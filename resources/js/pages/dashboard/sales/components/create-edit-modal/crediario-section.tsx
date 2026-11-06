import { CalendarClock, TriangleAlert } from 'lucide-react';
import { CardPaymentFields } from '@/components/payment/card-payment-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { formatCurrencyInput } from '@/utils/form-fields';
import { describeInstallments } from '@/utils/sale-installments';
import { SALE_MESSAGES } from '../../utils/constants';
import type { CrediarioSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function CrediarioSection({
    form,
    onEditClient,
}: CrediarioSectionProps) {
    const { crediario, selectedClient } = form;
    const creditProblem = !selectedClient
        ? null
        : !crediario.creditEnabled
          ? SALE_MESSAGES.creditDisabled
          : crediario.exceeded
            ? SALE_MESSAGES.creditExceeded
            : null;

    return (
        <StepSection
            icon={CalendarClock}
            title="Crediário"
            description="Entrada agora e o restante em parcelas"
        >
            <div className="space-y-4 text-sm">
                <div className="grid gap-2">
                    <Label htmlFor="crediario-entry">
                        Entrada{' '}
                        <span className="font-normal text-muted-foreground">
                            (opcional)
                        </span>
                    </Label>
                    <Input
                        id="crediario-entry"
                        type="text"
                        inputMode="numeric"
                        value={form.crediarioEntry}
                        onChange={(event) =>
                            form.setCrediarioEntry(
                                formatCurrencyInput(event.target.value),
                            )
                        }
                        placeholder="R$ 0,00"
                        aria-invalid={
                            form.crediarioEntry !== '' &&
                            crediario.entryError !== null
                        }
                        aria-describedby="crediario-entry-hint"
                    />
                    <p
                        id="crediario-entry-hint"
                        className={cn(
                            'text-xs',
                            form.crediarioEntry !== '' && crediario.entryError
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                        )}
                    >
                        {crediario.entryError ??
                            'Valor pago agora. Deixe em branco para parcelar o total.'}
                    </p>
                </div>

                <CardPaymentFields
                    cardType="credit"
                    onCardTypeChange={form.setCardType}
                    installments={String(crediario.installments)}
                    onInstallmentsChange={form.setInstallments}
                    firstInstallmentDate={form.firstInstallmentDate}
                    onFirstInstallmentDateChange={form.setFirstInstallmentDate}
                    totalAmount={crediario.financed}
                    showCardTypeToggle={false}
                    enableInstallments
                    maxInstallments={crediario.maxInstallments}
                />

                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border bg-muted/20 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">
                            Saldo financiado
                        </p>
                        <p className="font-semibold tabular-nums">
                            {formatCurrencyBR(crediario.financed)}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-muted/20 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">
                            Limite disponível
                        </p>
                        <p className="font-semibold tabular-nums">
                            {selectedClient
                                ? formatCurrencyBR(crediario.availableCredit)
                                : '-'}
                        </p>
                    </div>
                </div>

                {!selectedClient ? (
                    <p className="text-muted-foreground">
                        Escolha o cliente para ver o limite do crediário.
                    </p>
                ) : creditProblem ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-start gap-2 text-destructive">
                            <TriangleAlert
                                aria-hidden
                                className="mt-0.5 size-4 shrink-0"
                            />
                            {creditProblem}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={onEditClient}
                        >
                            Ajustar crediário do cliente
                        </Button>
                    </div>
                ) : crediario.entryError ? null : (
                    <p className="rounded-xl bg-accent/10 px-3 py-2.5 text-foreground">
                        A venda fica pendente até a quitação.{' '}
                        {crediario.entry > 0
                            ? 'A entrada é recebida agora e o saldo é dividido em'
                            : 'Sem entrada, o total é dividido em'}{' '}
                        <strong>
                            {describeInstallments(crediario.installmentAmounts)}
                        </strong>
                        .
                    </p>
                )}
            </div>
        </StepSection>
    );
}
