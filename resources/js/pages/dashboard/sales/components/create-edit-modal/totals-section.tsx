import { BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR } from '@/lib/format';
import type { TotalsSectionProps } from '../../utils/types';

export function TotalsSection({ form, onOpenDiscount }: TotalsSectionProps) {
    const hasDiscount = form.discountAmount > 0;
    const itemCount = form.lineItems.length;

    return (
        <section className="space-y-3 rounded-b-2xl bg-muted/30 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
                </span>
                <span className="tabular-nums">
                    {formatCurrencyBR(form.subtotal)}
                </span>
            </div>

            {hasDiscount ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                    <span className="flex items-center gap-1.5 font-medium text-accent">
                        <BadgePercent aria-hidden className="size-4" />
                        Desconto
                        {form.discount.type === 'percent'
                            ? ` (${form.discount.value.toLocaleString('pt-BR')}%)`
                            : ''}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent tabular-nums">
                            - {formatCurrencyBR(form.discountAmount)}
                        </span>
                        {onOpenDiscount ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={onOpenDiscount}
                            >
                                Alterar
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : onOpenDiscount ? (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Desconto</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5"
                        disabled={form.subtotal <= 0}
                        onClick={onOpenDiscount}
                    >
                        <BadgePercent className="size-3.5" />
                        Aplicar desconto
                    </Button>
                </div>
            ) : null}

            <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                <span className="font-semibold text-accent">Total</span>
                <span className="text-2xl font-black tabular-nums">
                    {formatCurrencyBR(form.total)}
                </span>
            </div>
        </section>
    );
}
