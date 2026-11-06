import { FileText } from 'lucide-react';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BOLETO_DAYS_PER_INSTALLMENT } from '../../utils/constants';
import { formatShortDate, getBoletoOptions } from '../../utils/functions';
import type { CheckoutSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function BoletoSection({ form }: CheckoutSectionProps) {
    const options = getBoletoOptions(form.purchaseDate);
    const count = form.boletos.length;

    return (
        <StepSection
            icon={FileText}
            title="Boletos"
            description={`Em quantos boletos o fornecedor vai cobrar, um a cada ${BOLETO_DAYS_PER_INSTALLMENT} dias`}
        >
            <div
                role="radiogroup"
                aria-label="Quantidade de boletos"
                className="grid grid-cols-2 gap-2 sm:grid-cols-5"
            >
                {options.map((option) => {
                    const isSelected = form.boletoTerm === option.term;

                    return (
                        <button
                            key={option.term}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => form.setBoletoTerm(option.term)}
                            className={cn(
                                'flex cursor-pointer flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors',
                                isSelected
                                    ? 'border-accent bg-accent/10'
                                    : 'hover:bg-muted',
                            )}
                        >
                            <span
                                className={cn(
                                    'text-2xl leading-none font-black tabular-nums',
                                    isSelected && 'text-accent',
                                )}
                            >
                                {option.count}
                            </span>
                            <span className="mt-1 text-sm font-semibold">
                                {option.count === 1 ? 'boleto' : 'boletos'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                {option.count === 1
                                    ? `em ${option.term} dias`
                                    : `a cada ${BOLETO_DAYS_PER_INSTALLMENT} dias`}
                            </span>
                            <span className="text-[11px] font-medium text-muted-foreground">
                                {option.count === 1 ? 'vence' : 'até'}{' '}
                                {formatShortDate(option.lastDueDate)}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 rounded-xl border">
                <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm">
                    <span className="font-medium">Vencimentos</span>
                    <span className="text-muted-foreground">
                        {count} {count === 1 ? 'boleto' : 'boletos'} ·{' '}
                        {formatCurrencyBR(form.total)}
                    </span>
                </div>
                <ul className="divide-y">
                    {form.boletos.map((boleto) => (
                        <li
                            key={boleto.number}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm"
                        >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                                {boleto.number}º
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    Vence em {formatDateBR(boleto.dueDate)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {BOLETO_DAYS_PER_INSTALLMENT *
                                        boleto.number}{' '}
                                    dias depois da compra
                                </p>
                            </div>
                            <span className="font-semibold tabular-nums">
                                {formatCurrencyBR(boleto.amount)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
                Os boletos vão para contas a pagar com esses vencimentos.
            </p>
        </StepSection>
    );
}
