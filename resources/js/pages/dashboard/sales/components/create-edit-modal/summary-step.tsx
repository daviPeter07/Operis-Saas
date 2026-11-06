import {
    BadgePercent,
    CalendarDays,
    Check,
    CreditCard,
    Eye,
    EyeOff,
    Printer,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { SALE_PAYMENT_ANSWERS } from '../../utils/constants';
import {
    calculateItemsProfit,
    getDraftPaymentLabel,
} from '../../utils/functions';
import type { SummaryStepProps } from '../../utils/types';

export function SummaryStep({
    draft,
    status,
    onStatusChange,
    paidInstallments,
    onPaidInstallmentsChange,
    onPrint,
}: SummaryStepProps) {
    const [showProfit, setShowProfit] = useState(false);
    const isCrediario = draft.paymentMethod === 'crediario';
    const hasDiscount = draft.discount > 0;
    const profit = calculateItemsProfit(draft.lineItems) - draft.discount;
    const itemCount = draft.lineItems.length;
    const installmentNumbers = Array.from(
        { length: draft.installments },
        (_, index) => index + 1,
    );
    const installmentAmount = (number: number) =>
        draft.installmentAmounts[number - 1] ?? 0;
    const paidAmount = paidInstallments.reduce(
        (sum, number) => sum + installmentAmount(number),
        0,
    );
    const allPaid = paidInstallments.length === installmentNumbers.length;

    const togglePaid = (number: number) =>
        onPaidInstallmentsChange(
            paidInstallments.includes(number)
                ? paidInstallments.filter((item) => item !== number)
                : [...paidInstallments, number],
        );

    return (
        <div className="mx-auto w-full max-w-3xl p-4">
            <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Cliente</p>
                        <p className="truncate text-xl font-bold">
                            {draft.clientName || 'Sem cliente'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-muted-foreground">
                                <CalendarDays
                                    aria-hidden
                                    className="size-3.5"
                                />
                                {formatDateBR(draft.date)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-muted-foreground">
                                <CreditCard aria-hidden className="size-3.5" />
                                {getDraftPaymentLabel(draft)}
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0 rounded-xl bg-accent/10 px-4 py-3 sm:text-right">
                        <p className="text-xs font-medium text-accent">
                            Total da venda
                        </p>
                        <p className="text-3xl font-black tabular-nums">
                            {formatCurrencyBR(draft.total)}
                        </p>
                    </div>
                </div>

                <div className="border-t px-5 py-4">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold">Itens</p>
                        <p className="text-sm text-muted-foreground">
                            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                        </p>
                    </div>
                    <ul className="divide-y">
                        {draft.lineItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-4 py-2.5"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} ×{' '}
                                        {formatCurrencyBR(item.unitPrice)}
                                    </p>
                                </div>
                                <p className="text-sm font-medium tabular-nums">
                                    {formatCurrencyBR(item.subtotal)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2 border-t bg-muted/30 px-5 py-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="tabular-nums">
                            {formatCurrencyBR(draft.subtotal)}
                        </span>
                    </div>
                    {hasDiscount ? (
                        <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                            <span className="flex items-center gap-1.5 font-medium text-accent">
                                <BadgePercent aria-hidden className="size-4" />
                                Desconto
                            </span>
                            <span className="font-semibold text-accent tabular-nums">
                                - {formatCurrencyBR(draft.discount)}
                            </span>
                        </div>
                    ) : null}
                    {isCrediario ? (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Entrada
                            </span>
                            <span className="tabular-nums">
                                {(draft.crediarioEntry ?? 0) > 0
                                    ? formatCurrencyBR(
                                          draft.crediarioEntry ?? 0,
                                      )
                                    : 'Sem entrada'}
                            </span>
                        </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lucro</span>
                        <button
                            type="button"
                            onClick={() => setShowProfit((current) => !current)}
                            aria-label={
                                showProfit ? 'Esconder lucro' : 'Mostrar lucro'
                            }
                            className="flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <span
                                className={cn(
                                    'tabular-nums',
                                    showProfit && 'font-medium text-foreground',
                                )}
                            >
                                {showProfit ? formatCurrencyBR(profit) : '••••'}
                            </span>
                            {showProfit ? (
                                <EyeOff aria-hidden className="size-4" />
                            ) : (
                                <Eye aria-hidden className="size-4" />
                            )}
                        </button>
                    </div>
                </div>

                {draft.notes.trim() ? (
                    <div className="border-t px-5 py-4">
                        <p className="text-xs text-muted-foreground">
                            Observações
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-line">
                            {draft.notes}
                        </p>
                    </div>
                ) : null}

                <div className="border-t px-5 py-4">
                    <p className="font-semibold">
                        {isCrediario
                            ? 'O cliente já pagou alguma parcela?'
                            : 'O cliente já pagou?'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {isCrediario
                            ? 'No crediário a venda fica pendente até a última parcela ser paga. Marque as que ele já pagou.'
                            : 'Escolha "Paga" se você já recebeu o pagamento.'}
                    </p>

                    {isCrediario ? (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {installmentNumbers.map((number) => {
                                    const isPaid =
                                        paidInstallments.includes(number);

                                    return (
                                        <button
                                            key={number}
                                            type="button"
                                            aria-pressed={isPaid}
                                            onClick={() => togglePaid(number)}
                                            className={cn(
                                                'flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                                                isPaid
                                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <span>
                                                <span className="block text-sm font-medium">
                                                    Parcela {number}/
                                                    {draft.installments}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {formatCurrencyBR(
                                                        installmentAmount(
                                                            number,
                                                        ),
                                                    )}
                                                </span>
                                            </span>
                                            {isPaid ? (
                                                <Check
                                                    aria-hidden
                                                    className="size-4 text-emerald-500"
                                                />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p
                                    className={cn(
                                        'text-sm',
                                        paidInstallments.length > 0
                                            ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {paidInstallments.length > 0
                                        ? `${paidInstallments.length} ${paidInstallments.length === 1 ? 'parcela paga' : 'parcelas pagas'}: ${formatCurrencyBR(paidAmount)}`
                                        : 'Nenhuma parcela paga ainda.'}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        onPaidInstallmentsChange(
                                            allPaid ? [] : installmentNumbers,
                                        )
                                    }
                                >
                                    {allPaid
                                        ? 'Desmarcar todas'
                                        : 'Marcar todas'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            role="radiogroup"
                            aria-label="Situação da venda"
                            className="mt-3 grid gap-2 sm:grid-cols-2"
                        >
                            {SALE_PAYMENT_ANSWERS.map((answer) => {
                                const isSelected = status === answer.value;
                                const isPaidAnswer =
                                    answer.value === 'completed';

                                return (
                                    <button
                                        key={answer.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() =>
                                            onStatusChange(answer.value)
                                        }
                                        className={cn(
                                            'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                                            !isSelected && 'hover:bg-muted',
                                            isSelected &&
                                                isPaidAnswer &&
                                                'border-emerald-500/60 bg-emerald-500/10',
                                            isSelected &&
                                                !isPaidAnswer &&
                                                'border-amber-500/60 bg-amber-500/10',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/40',
                                                isSelected &&
                                                    isPaidAnswer &&
                                                    'border-emerald-500 bg-emerald-500 text-white',
                                                isSelected &&
                                                    !isPaidAnswer &&
                                                    'border-amber-500 bg-amber-500 text-white',
                                            )}
                                        >
                                            {isSelected ? (
                                                <Check
                                                    aria-hidden
                                                    className="size-3"
                                                />
                                            ) : null}
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold">
                                                {answer.label}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {answer.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t p-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={onPrint}
                    >
                        <Printer className="size-4" />
                        Imprimir Nota
                    </Button>
                </div>
            </div>
        </div>
    );
}
