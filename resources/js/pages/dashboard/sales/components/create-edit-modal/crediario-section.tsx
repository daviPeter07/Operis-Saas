import { CardPaymentFields } from '@/components/payment/card-payment-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { formatCurrencyInput } from '@/utils/form-fields';
import { SALE_MESSAGES } from '../../utils/constants';
import type { CrediarioSectionProps } from '../../utils/types';

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
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Crediário do cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="grid gap-2">
                    <Label htmlFor="crediario-entry">
                        Entrada no crediário
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
                            'Valor pago agora. O restante vira parcelas.'}
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
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        Saldo financiado
                    </span>
                    <span className="font-semibold">
                        {formatCurrencyBR(crediario.financed)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        Limite disponível
                    </span>
                    <span className="font-semibold">
                        {selectedClient
                            ? formatCurrencyBR(crediario.availableCredit)
                            : '-'}
                    </span>
                </div>
                {!selectedClient ? (
                    <p className="text-muted-foreground">
                        Escolha o cliente para ver o limite do crediário.
                    </p>
                ) : creditProblem ? (
                    <div className="space-y-2">
                        <p className="text-destructive">{creditProblem}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onEditClient}
                        >
                            Ajustar crediário do cliente
                        </Button>
                    </div>
                ) : crediario.entryError ? null : (
                    <p className="text-muted-foreground">
                        A venda fica pendente até a quitação: a entrada é
                        recebida agora e o saldo financiado é dividido em{' '}
                        {crediario.installments}x de{' '}
                        {formatCurrencyBR(crediario.installmentValue)}.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
