import { CalendarDays, Check, CreditCard } from 'lucide-react';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PURCHASE_PAYMENT_ANSWERS } from '../../utils/constants';
import { getDraftPaymentLabel } from '../../utils/functions';
import type { SummaryStepProps } from '../../utils/types';

export function SummaryStep({
    draft,
    status,
    onStatusChange,
}: SummaryStepProps) {
    const isCash = draft.paymentMethod === 'money';
    const isBoleto = draft.paymentMethod === 'boleto';
    const itemCount = draft.lineItems.length;

    return (
        <div className="mx-auto w-full max-w-3xl p-4">
            <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                            Fornecedor
                        </p>
                        <p className="truncate text-xl font-bold">
                            {draft.supplierName || 'Sem fornecedor'}
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
                            Total da compra
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
                                        {formatCurrencyBR(item.unitCost)}
                                    </p>
                                </div>
                                <p className="text-sm font-medium tabular-nums">
                                    {formatCurrencyBR(item.subtotal)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {isBoleto ? (
                    <div className="border-t bg-muted/30 px-5 py-4">
                        <p className="mb-2 text-sm font-semibold">
                            Boletos em contas a pagar
                        </p>
                        <ul className="space-y-1.5 text-sm">
                            {draft.boletos.map((boleto) => (
                                <li
                                    key={boleto.number}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <span className="text-muted-foreground">
                                        {boleto.number}º boleto · vence{' '}
                                        {formatDateBR(boleto.dueDate)}
                                    </span>
                                    <span className="tabular-nums">
                                        {formatCurrencyBR(boleto.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

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
                    <p className="font-semibold">A compra já foi paga?</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {isCash
                            ? 'Compra em dinheiro é paga na hora.'
                            : isBoleto
                              ? 'Escolha "Paga" só se todos os boletos já foram pagos.'
                              : 'Escolha "Paga" se você já pagou o fornecedor.'}
                    </p>

                    <div
                        role="radiogroup"
                        aria-label="Situação da compra"
                        className="mt-3 grid gap-2 sm:grid-cols-2"
                    >
                        {PURCHASE_PAYMENT_ANSWERS.map((answer) => {
                            const isSelected = status === answer.value;
                            const isPaidAnswer = answer.value === 'completed';

                            return (
                                <button
                                    key={answer.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    disabled={isCash && !isPaidAnswer}
                                    onClick={() => onStatusChange(answer.value)}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
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
                </div>
            </div>
        </div>
    );
}
