import { cn } from '@/lib/utils';
import type { DemoMetric } from '../../utils/types';

export function MetricCard({
    metric,
    compact = false,
}: {
    metric: DemoMetric;
    compact?: boolean;
}) {
    const Icon = metric.icon;

    return (
        <div
            className={cn(
                'flex flex-col justify-between rounded-xl border border-neutral-200/70 bg-white',
                compact ? 'min-h-20 px-3 py-2.5' : 'min-h-24 px-5 pt-2.5 pb-3',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span
                    className={cn(
                        'font-medium text-neutral-500',
                        compact ? 'text-xs' : 'text-sm',
                    )}
                >
                    {metric.label}
                </span>
                <span
                    className={cn(
                        'flex items-center justify-center ring-1',
                        compact ? 'size-6 rounded-lg' : 'size-8 rounded-xl',
                        metric.iconClassName,
                    )}
                >
                    <Icon className={compact ? 'size-3' : 'size-4'} />
                </span>
            </div>
            <span
                className={cn(
                    'leading-none font-bold',
                    compact ? 'text-base' : 'text-xl',
                )}
            >
                {metric.value}
            </span>
        </div>
    );
}
