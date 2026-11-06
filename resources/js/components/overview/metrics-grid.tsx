import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    Info,
    Minus,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PeriodComparison } from '@/utils/period-range';

export interface MetricTrend extends PeriodComparison {
    /** e.g. "vs. mês passado" */
    comparisonLabel: string;
}

export interface Metric {
    id: string;
    label: string;
    value: string;
    icon: string;
    color: string;
    iconBackground: string;
    iconRing: string;
    /** Growth compared with the previous period (sales and profit). */
    trend?: MetricTrend;
    /** Short context line when a trend does not apply (e.g. overdue count). */
    detail?: { text: string; tone: 'neutral' | 'warning' };
    /** Set when the value ignores the period filter (open accounts of every period). */
    scopeNote?: { label: string; description: string };
}

interface MetricsGridProps {
    isLoading?: boolean;
    metrics: Metric[];
}

const iconMap: Record<string, LucideIcon> = {
    ShoppingCart,
    TrendingUp,
    Receipt,
    CreditCard,
    Wallet,
};

function formatPercent(percent: number): string {
    // No thousands separator: "13.916%" read as 13 with three decimals.
    const formatted = Math.abs(percent).toLocaleString('pt-BR', {
        maximumFractionDigits: 2,
        useGrouping: false,
    });

    return `${percent >= 0 ? '+' : '-'}${formatted}%`;
}

function TrendLine({ trend }: { trend: MetricTrend }) {
    const Icon =
        trend.direction === 'up'
            ? ArrowUpRight
            : trend.direction === 'down'
              ? ArrowDownRight
              : Minus;

    return (
        <p className="mt-2 flex flex-wrap items-center gap-x-1 text-[11px] leading-tight sm:text-xs">
            <span
                className={cn(
                    'inline-flex items-center gap-0.5 font-semibold',
                    trend.direction === 'up' &&
                        'text-emerald-600 dark:text-emerald-400',
                    trend.direction === 'down' &&
                        'text-red-600 dark:text-red-400',
                    trend.direction === 'flat' && 'text-muted-foreground',
                )}
            >
                <Icon aria-hidden className="size-3.5" />
                {trend.percent !== null
                    ? formatPercent(trend.percent)
                    : 'Sem variação'}
            </span>
            <span className="text-muted-foreground">
                {trend.comparisonLabel}
            </span>
        </p>
    );
}

export function MetricsGrid({ metrics, isLoading = false }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {metrics.map((metric) => {
                const Icon = iconMap[metric.icon] || Wallet;

                return (
                    <Card key={metric.id} className="border-border/40 bg-card">
                        <CardContent className="flex min-h-20 flex-col justify-between px-3 py-2.5 sm:min-h-24 sm:px-5 sm:pb-3">
                            <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <span className="text-xs font-medium text-muted-foreground/90 sm:text-sm">
                                    {metric.label}
                                </span>
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-lg ring-1 sm:h-8 sm:w-8 sm:rounded-xl ${metric.iconBackground} ${metric.iconRing}`}
                                >
                                    <Icon
                                        className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`}
                                    />
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-28" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            ) : (
                                <div>
                                    <span className="text-lg leading-none font-bold text-foreground sm:text-xl">
                                        {metric.value}
                                    </span>
                                    {metric.trend && (
                                        <TrendLine trend={metric.trend} />
                                    )}
                                    {!metric.trend && metric.detail && (
                                        <p
                                            className={cn(
                                                'mt-2 text-[11px] leading-tight sm:text-xs',
                                                metric.detail.tone === 'warning'
                                                    ? 'font-semibold text-red-600 dark:text-red-400'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {metric.detail.text}
                                        </p>
                                    )}
                                    {metric.scopeNote ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p
                                                    tabIndex={0}
                                                    className="mt-1 inline-flex cursor-help items-center gap-1 text-[11px] leading-tight text-muted-foreground sm:text-xs"
                                                >
                                                    <Info
                                                        aria-hidden
                                                        className="size-3 shrink-0"
                                                    />
                                                    {metric.scopeNote.label}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                className="max-w-64"
                                            >
                                                {metric.scopeNote.description}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : null}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
