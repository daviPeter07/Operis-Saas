import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR, formatDateBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PaidBoletosProps } from '../../utils/types';

export function PaidBoletos({ boletos, paid, onChange }: PaidBoletosProps) {
    const allPaid = boletos.length > 0 && paid.length === boletos.length;
    const paidAmount = boletos
        .filter((boleto) => paid.includes(boleto.number))
        .reduce((sum, boleto) => sum + boleto.amount, 0);
    const openAmount = boletos.reduce((sum, boleto) => sum + boleto.amount, 0);

    const toggle = (number: number) =>
        onChange(
            paid.includes(number)
                ? paid.filter((item) => item !== number)
                : [...paid, number],
        );

    return (
        <div className="mt-3 space-y-3">
            <ul className="divide-y rounded-xl border">
                {boletos.map((boleto) => {
                    const isPaid = paid.includes(boleto.number);

                    return (
                        <li key={boleto.number}>
                            <button
                                type="button"
                                aria-pressed={isPaid}
                                onClick={() => toggle(boleto.number)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors',
                                    isPaid
                                        ? 'bg-emerald-500/10'
                                        : 'hover:bg-muted',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-md border-2',
                                        isPaid
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-muted-foreground/40',
                                    )}
                                >
                                    {isPaid ? (
                                        <Check aria-hidden className="size-3" />
                                    ) : null}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium">
                                        {boleto.number}º boleto
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        Vence em {formatDateBR(boleto.dueDate)}
                                    </span>
                                </span>
                                <span className="text-right">
                                    <span className="block text-sm font-semibold tabular-nums">
                                        {formatCurrencyBR(boleto.amount)}
                                    </span>
                                    <span
                                        className={cn(
                                            'block text-xs',
                                            isPaid
                                                ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {isPaid ? 'Pago' : 'Em aberto'}
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    {paid.length} de {boletos.length} pagos ·{' '}
                    <span className="font-medium text-foreground">
                        {formatCurrencyBR(paidAmount)}
                    </span>{' '}
                    pago ·{' '}
                    <span className="font-medium text-foreground">
                        {formatCurrencyBR(openAmount - paidAmount)}
                    </span>{' '}
                    em aberto
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        onChange(
                            allPaid
                                ? []
                                : boletos.map((boleto) => boleto.number),
                        )
                    }
                >
                    {allPaid ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
            </div>
        </div>
    );
}
