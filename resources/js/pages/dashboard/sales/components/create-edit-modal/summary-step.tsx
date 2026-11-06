import { BadgePercent, Check, Eye, EyeOff, Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
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

    const togglePaid = (number: number) =>
        onPaidInstallmentsChange(
            paidInstallments.includes(number)
                ? paidInstallments.filter((item) => item !== number)
                : [...paidInstallments, number],
        );

    const facts = [
        { label: 'Cliente', value: draft.clientName || 'Sem cliente' },
        { label: 'Data da venda', value: formatDateBR(draft.date) },
        { label: 'Pagamento', value: getDraftPaymentLabel(draft) },
    ];

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    {facts.map((fact) => (
                        <div
                            key={fact.label}
                            className="rounded-xl border bg-card px-4 py-3"
                        >
                            <p className="text-xs text-muted-foreground">
                                {fact.label}
                            </p>
                            <p className="mt-1 truncate font-semibold">
                                {fact.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <p className="font-semibold">Itens</p>
                        <p className="text-sm text-muted-foreground">
                            {draft.lineItems.length}{' '}
                            {draft.lineItems.length === 1 ? 'item' : 'itens'}
                        </p>
                    </div>
                    <ul className="divide-y">
                        {draft.lineItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-4 px-4 py-3"
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
                                <p className="font-medium tabular-nums">
                                    {formatCurrencyBR(item.subtotal)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {draft.notes.trim() ? (
                    <div className="rounded-xl border bg-card px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                            Observações
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-line">
                            {draft.notes}
                        </p>
                    </div>
                ) : null}

                <div className="rounded-xl border bg-card p-4">
                    <p className="font-semibold">Situação da venda</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {isCrediario
                            ? 'No crediário a venda fica pendente até todas as parcelas serem pagas.'
                            : 'Marque como paga se o cliente já pagou.'}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={
                                status === 'pending' ? 'default' : 'outline'
                            }
                            onClick={() => onStatusChange('pending')}
                        >
                            Pendente
                        </Button>
                        <Button
                            type="button"
                            variant={
                                status === 'completed' ? 'default' : 'outline'
                            }
                            disabled={isCrediario}
                            onClick={() => onStatusChange('completed')}
                        >
                            Paga
                        </Button>
                    </div>

                    {isCrediario ? (
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">
                                    Parcelas já pagas
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        onPaidInstallmentsChange(
                                            paidInstallments.length ===
                                                installmentNumbers.length
                                                ? []
                                                : installmentNumbers,
                                        )
                                    }
                                >
                                    {paidInstallments.length ===
                                    installmentNumbers.length
                                        ? 'Desmarcar todas'
                                        : 'Marcar todas'}
                                </Button>
                            </div>
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
                                                    {number}/
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
                            {paidInstallments.length > 0 ? (
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    {paidInstallments.length}{' '}
                                    {paidInstallments.length === 1
                                        ? 'parcela paga'
                                        : 'parcelas pagas'}
                                    : {formatCurrencyBR(paidAmount)}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
                <div className="space-y-3 rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="tabular-nums">
                            {formatCurrencyBR(draft.subtotal)}
                        </span>
                    </div>

                    {hasDiscount ? (
                        <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
                            <span className="flex items-center gap-1.5 font-medium text-accent">
                                <BadgePercent aria-hidden className="size-4" />
                                Desconto
                            </span>
                            <span className="font-semibold text-accent tabular-nums">
                                - {formatCurrencyBR(draft.discount)}
                            </span>
                        </div>
                    ) : null}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-black tabular-nums">
                            {formatCurrencyBR(draft.total)}
                        </span>
                    </div>

                    {isCrediario ? (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Entrada
                            </span>
                            <span className="tabular-nums">
                                {formatCurrencyBR(draft.crediarioEntry ?? 0)}
                            </span>
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between text-sm">
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

                <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={onPrint}
                >
                    <Printer className="size-4" />
                    Ver comprovante
                </Button>
            </div>
        </div>
    );
}
