import {
    TrendingUp,
    TrendingDown,
    Receipt,
    CreditCard,
    ShoppingCart,
    Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface Metric {
    id: string;
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: string;
    color: string;
    iconBackground: string;
    iconRing: string;
}

interface MetricsGridProps {
    metrics: Metric[];
}

const iconMap: Record<string, LucideIcon> = {
    ShoppingCart,
    TrendingUp,
    Receipt,
    CreditCard,
    Wallet,
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {metrics.map((metric) => {
                const Icon = iconMap[metric.icon] || Wallet;
                const isPositive = metric.trend === 'up';

                return (
                    <Card key={metric.id} className="border-border/40 bg-card">
                        <CardContent className="flex min-h-24 flex-col justify-between px-5 pb-3">
                            <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-muted-foreground/90">
                                    {metric.label}
                                </span>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${metric.iconBackground} ${metric.iconRing}`}
                                >
                                    <Icon
                                        className={`h-4 w-4 ${metric.color}`}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-3">
                                <span className="text-xl leading-none font-bold text-foreground">
                                    {metric.value}
                                </span>
                                <div
                                    className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    <span>{Math.abs(metric.change)}%</span>
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
