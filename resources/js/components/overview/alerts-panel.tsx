import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface OverviewAlert {
    id: string;
    label: string;
    value: number;
}

interface AlertsPanelProps {
    alerts: OverviewAlert[];
    onSelect: (alertId: string) => void;
    isLoading?: boolean;
}

/** "Alertas e lembretes": each row opens the module filtered by that alert. */
export function AlertsPanel({
    alerts,
    onSelect,
    isLoading = false,
}: AlertsPanelProps) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-4 font-semibold">Alertas e lembretes</h3>
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <button
                        type="button"
                        key={alert.id}
                        onClick={() => onSelect(alert.id)}
                        disabled={isLoading}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-left transition-colors outline-none hover:border-accent/50 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] disabled:pointer-events-none"
                    >
                        <span className="flex-1 text-sm font-medium text-foreground">
                            {alert.label}
                        </span>
                        {isLoading ? (
                            <Skeleton className="h-7 w-10 rounded-full" />
                        ) : (
                            <span
                                className={cn(
                                    'inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold',
                                    alert.value > 0
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-muted text-foreground',
                                )}
                            >
                                {alert.value}
                            </span>
                        )}
                        <ChevronRight
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
