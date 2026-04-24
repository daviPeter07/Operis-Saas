import {
    TrendingUp,
    TrendingDown,
    Receipt,
    CreditCard,
    ShoppingCart,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {metrics.map((metric) => {
                const Icon = iconMap[metric.icon] || Wallet;
                const isPositive = metric.trend === 'up';

                return (
                    <Card key={metric.id} className="border-border/40 bg-card">
                        <CardContent className="flex min-h-20 flex-col justify-between px-3 py-2.5 sm:min-h-24 sm:px-5 sm:pb-3">
                            <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <span className="text-xs font-medium text-muted-foreground/90 sm:text-sm">
                                    {metric.label}
                                </span>
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl ring-1 ${metric.iconBackground} ${metric.iconRing}`}
                                >
                                    <Icon
                                        className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-2 sm:gap-3">
                                <span className="text-lg leading-none font-bold text-foreground sm:text-xl">
                                    {metric.value}
                                </span>
                                <div
                                    className={`flex items-center gap-1 text-xs font-medium sm:text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    <span>{Math.abs(metric.change)}%</span>
                                    {isPositive ? (
                                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    ) : (
                                        <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
