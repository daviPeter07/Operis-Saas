import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrencyBR } from '@/lib/format';
import type { TotalsSectionProps } from '../../utils/types';

export function TotalsSection({ form, onOpenDiscount }: TotalsSectionProps) {
    const hasDiscount = form.discountAmount > 0;

    return (
        <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrencyBR(form.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    Desconto
                    {hasDiscount && form.discount.type === 'percent'
                        ? ` (${form.discount.value.toLocaleString('pt-BR')}%)`
                        : ''}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-green-600">
                        - {formatCurrencyBR(form.discountAmount)}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={form.subtotal <= 0}
                        onClick={onOpenDiscount}
                    >
                        {hasDiscount ? 'Alterar' : 'Aplicar'}
                    </Button>
                </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-black text-primary">
                    {formatCurrencyBR(form.total)}
                </span>
            </div>
        </div>
    );
}
