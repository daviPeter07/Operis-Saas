import {
    Minus,
    PackageOpen,
    Plus,
    ShoppingCart,
    Trash2,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyBR } from '@/lib/format';
import type { CheckoutSectionProps } from '../../utils/types';
import { StepSection } from './step-section';

export function CartSection({ form }: CheckoutSectionProps) {
    const unitsCount = form.lineItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    return (
        <StepSection
            icon={ShoppingCart}
            title="Carrinho"
            description={
                unitsCount > 0
                    ? `${unitsCount} ${unitsCount === 1 ? 'unidade' : 'unidades'} · ajuste as quantidades`
                    : 'Nenhum item ainda'
            }
        >
            {form.lineItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                    <PackageOpen aria-hidden className="size-6" />
                    Volte para o primeiro passo e escolha produtos ou serviços.
                </div>
            ) : (
                <ul className="divide-y rounded-xl border">
                    {form.lineItems.map((item) => (
                        <li
                            key={item.id}
                            className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                                {item.kind === 'service' ? (
                                    <Wrench aria-hidden className="size-4" />
                                ) : (
                                    item.productName.slice(0, 2).toUpperCase()
                                )}
                            </span>
                            <div className="min-w-0 flex-1 basis-32">
                                <p className="truncate text-sm font-medium">
                                    {item.productName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.kind === 'service'
                                        ? 'Serviço · '
                                        : ''}
                                    {formatCurrencyBR(item.unitPrice)} cada
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <div className="flex items-center rounded-lg border">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-r-none"
                                        aria-label={`Diminuir quantidade de ${item.productName}`}
                                        onClick={() =>
                                            form.decreaseQuantity(item.id)
                                        }
                                    >
                                        <Minus className="size-3.5" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-l-none"
                                        aria-label={`Aumentar quantidade de ${item.productName}`}
                                        onClick={() =>
                                            form.increaseQuantity(item.id)
                                        }
                                    >
                                        <Plus className="size-3.5" />
                                    </Button>
                                </div>
                                <span className="w-24 text-right text-sm font-semibold tabular-nums">
                                    {formatCurrencyBR(item.subtotal)}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-destructive"
                                    aria-label={`Remover ${item.productName}`}
                                    onClick={() => form.removeItem(item.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </StepSection>
    );
}
