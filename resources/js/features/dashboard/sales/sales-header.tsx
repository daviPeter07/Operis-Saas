import { Coins, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBR } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface SalesHeaderMetrics {
    salesCount: number;
    salesTotal: number;
    profit: number;
    receivable: number;
}

interface SalesHeaderProps {
    metrics: SalesHeaderMetrics;
}

const metricCards = [
    {
        key: 'salesCount',
        label: 'Quantidade de vendas',
        icon: TrendingUp,
        format: (value: number) => String(value),
    },
    {
        key: 'salesTotal',
        label: 'Valor em vendas',
        icon: DollarSign,
        format: (value: number) => formatCurrencyBR(value),
    },
    {
        key: 'profit',
        label: 'Lucros',
        icon: Percent,
        format: (value: number) => formatCurrencyBR(value),
    },
    {
        key: 'receivable',
        label: 'Total a receber',
        icon: Coins,
        format: (value: number) => formatCurrencyBR(value),
    },
] as const;

export function SalesHeader({ metrics }: SalesHeaderProps) {
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
                        <CardContent className="flex min-h-[110px] items-center justify-between gap-4 px-5 py-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="text-[2rem] leading-none font-black tracking-tight text-foreground">
                                    {card.format(value)}
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                                <Icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
