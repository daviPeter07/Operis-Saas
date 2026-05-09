import { ShoppingCart, DollarSign, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface PurchaseHeaderMetrics {
    purchaseCount: number;
    purchaseTotal: number;
    payable: number;
}

interface PurchaseHeaderProps {
    metrics: PurchaseHeaderMetrics;
}

const metricCards = [
    {
        key: 'purchaseCount',
        label: 'Quantidade de compras',
        icon: ShoppingCart,
        format: (value: number) => String(value),
    },
    {
        key: 'purchaseTotal',
        label: 'Valor em compras',
        icon: DollarSign,
        format: (value: number) => formatCurrencyBR(value),
    },
    {
        key: 'payable',
        label: 'Total a pagar',
        icon: CreditCard,
        format: (value: number) => formatCurrencyBR(value),
    },
] as const;

export function PurchaseHeader({ metrics }: PurchaseHeaderProps) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => {
                const Icon = card.icon;
                const value = metrics[card.key];

                return (
                    <Card
                        key={card.key}
                        className={cn(
                            'overflow-hidden border-border bg-card shadow-sm',
                            'transition-shadow hover:shadow-md',
                        )}
                    >
                        <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="text-2xl leading-none font-black tracking-tight text-foreground">
                                    {card.format(value)}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/25">
                                <Icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}