import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrencyBR } from '@/lib/format';
import type { CheckoutSectionProps } from '../../utils/types';

export function CartSection({ form }: CheckoutSectionProps) {
    const itemsCount = form.lineItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Carrinho</CardTitle>
                    {itemsCount > 0 ? (
                        <span className="text-xs text-muted-foreground">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                        </span>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {form.lineItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum item no carrinho. Escolha produtos no catálogo.
                    </p>
                ) : (
                    form.lineItems.map((item) => (
                        <div key={item.id} className="rounded-md border p-2">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} x{' '}
                                        {formatCurrencyBR(item.unitPrice)} ={' '}
                                        <span className="font-medium text-foreground">
                                            {formatCurrencyBR(item.subtotal)}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                aria-label="Diminuir quantidade"
                                                onClick={() =>
                                                    form.decreaseQuantity(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Diminuir quantidade
                                        </TooltipContent>
                                    </Tooltip>
                                    <span className="w-6 text-center text-sm tabular-nums">
                                        {item.quantity}
                                    </span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                aria-label="Aumentar quantidade"
                                                onClick={() =>
                                                    form.increaseQuantity(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Aumentar quantidade
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Remover item"
                                                onClick={() =>
                                                    form.removeItem(item.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Remover item
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
