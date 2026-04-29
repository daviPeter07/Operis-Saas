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
        <div className="space-y-3">
            <Card className="overflow-hidden border-border/70 bg-linear-to-r from-primary/10 via-background to-background">
                <CardContent className="px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Gestao de vendas
                    </p>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Painel comercial
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe resultados e crie novas vendas sem sair desta tela.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => {
                    const Icon = card.icon;
                    const value = metrics[card.key];

                    return (
                        <Card
                            key={card.key}
                            className={cn(
                                'overflow-hidden border-border/70 bg-card/95 shadow-sm',
                                'transition-shadow hover:shadow-md',
                            )}
                        >
                            <CardContent className="flex min-h-28 items-center justify-between gap-4 px-5 py-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {card.label}
                                    </p>
                                    <p className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                        {card.format(value)}
                                    </p>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/10 sm:h-16 sm:w-16">
                                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
