import { History } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DetailsCard } from '@/components/details-page';
import { formatCurrencyBR, formatDateTimeManaus } from '@/lib/format';
import { cn } from '@/lib/utils';

export type HistoryTimelineTone = 'default' | 'success' | 'warning' | 'danger';

export type HistoryTimelineItem = {
    id: string;
    title: string;
    date: string;
    description?: string | null;
    amount?: number | null;
    icon?: LucideIcon;
    tone?: HistoryTimelineTone;
};

type HistoryTimelineProps = {
    items: HistoryTimelineItem[];
    title?: string;
    emptyMessage?: string;
};

const TONE_CLASS: Record<HistoryTimelineTone, string> = {
    default: 'bg-muted text-muted-foreground ring-border',
    success:
        'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
    warning:
        'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
    danger: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
};

export function HistoryTimeline({
    items,
    title = 'Histórico',
    emptyMessage = 'Nenhum registro no histórico ainda.',
}: HistoryTimelineProps) {
    return (
        <DetailsCard title={title}>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
                <ol className="relative space-y-5">
                    {items.map((item, index) => {
                        const Icon = item.icon ?? History;
                        const isLast = index === items.length - 1;

                        return (
                            <li key={item.id} className="relative flex gap-3">
                                {isLast ? null : (
                                    <span
                                        aria-hidden
                                        className="absolute top-8 bottom-[-1.25rem] left-4 w-px bg-border"
                                    />
                                )}
                                <span
                                    className={cn(
                                        'relative flex size-8 shrink-0 items-center justify-center rounded-full ring-1',
                                        TONE_CLASS[item.tone ?? 'default'],
                                    )}
                                >
                                    <Icon aria-hidden className="size-4" />
                                </span>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {item.title}
                                        </p>
                                        {item.description ? (
                                            <p className="text-sm break-words text-muted-foreground">
                                                {item.description}
                                            </p>
                                        ) : null}
                                        <time
                                            dateTime={item.date}
                                            className="text-xs text-muted-foreground"
                                        >
                                            {formatDateTimeManaus(item.date)}
                                        </time>
                                    </div>
                                    {item.amount !== null &&
                                    item.amount !== undefined ? (
                                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                                            {formatCurrencyBR(item.amount)}
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </DetailsCard>
    );
}
