import { formatCurrencyBR } from '@/lib/format';
import type { CheckoutSectionProps } from '../../utils/types';

export function TotalsSection({ form }: CheckoutSectionProps) {
    const itemCount = form.lineItems.length;
    const unitsCount = form.lineItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    return (
        <section className="space-y-3 rounded-b-2xl bg-muted/30 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'itens'} ·{' '}
                    {unitsCount} {unitsCount === 1 ? 'unidade' : 'unidades'}
                </span>
                <span className="tabular-nums">
                    {formatCurrencyBR(form.total)}
                </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                <span className="font-semibold text-accent">Total</span>
                <span className="text-2xl font-black tabular-nums">
                    {formatCurrencyBR(form.total)}
                </span>
            </div>
        </section>
    );
}
