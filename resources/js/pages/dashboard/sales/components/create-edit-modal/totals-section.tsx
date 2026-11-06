import { BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { TotalsSectionProps } from '../../utils/types';

export function TotalsSection({ form, onOpenDiscount }: TotalsSectionProps) {
    const hasDiscount = form.discountAmount > 0;

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    Subtotal ({form.lineItems.length}{' '}
                    {form.lineItems.length === 1 ? 'item' : 'itens'})
                </span>
                <span>{formatCurrencyBR(form.subtotal)}</span>
            </div>

            <div
                className={cn(
                    'flex items-center justify-between gap-2 rounded-lg text-sm',
                    hasDiscount &&
                        'border border-accent/30 bg-accent/10 px-3 py-2',
                )}
            >
                <span
                    className={cn(
                        'flex items-center gap-1.5',
                        hasDiscount
                            ? 'font-medium text-accent'
                            : 'text-muted-foreground',
                    )}
                >
                    <BadgePercent aria-hidden className="size-4" />
                    Desconto
                    {hasDiscount && form.discount.type === 'percent'
                        ? ` (${form.discount.value.toLocaleString('pt-BR')}%)`
                        : ''}
                </span>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'tabular-nums',
                            hasDiscount
                                ? 'font-semibold text-accent'
                                : 'text-muted-foreground',
                        )}
                    >
                        - {formatCurrencyBR(form.discountAmount)}
                    </span>
                    {onOpenDiscount ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={form.subtotal <= 0}
                            onClick={onOpenDiscount}
                        >
                            {hasDiscount ? 'Alterar' : 'Aplicar'}
                        </Button>
                    ) : null}
                </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black tabular-nums">
                    {formatCurrencyBR(form.total)}
                </span>
            </div>
        </div>
    );
}
