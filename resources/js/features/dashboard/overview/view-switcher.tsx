import { BarChart3, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type OverviewView = 'kpi' | 'chart';

interface ViewSwitcherProps {
    view: OverviewView;
    onViewChange: (view: OverviewView) => void;
}

const options: { value: OverviewView; label: string; icon: LucideIcon }[] = [
    { value: 'kpi', label: 'Indicadores', icon: LayoutGrid },
    { value: 'chart', label: 'Gráficos', icon: BarChart3 },
];

/**
 * Segmented control between the indicator cards and the charts. Both options
 * have the same width so the highlight can slide between them.
 */
export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
    const activeIndex = options.findIndex((option) => option.value === view);

    return (
        <div
            role="radiogroup"
            aria-label="Visualização da visão geral"
            className="relative grid h-10 w-full shrink-0 grid-cols-2 rounded-lg border border-border bg-muted/60 p-0.5 sm:h-9 sm:w-auto"
        >
            <span
                aria-hidden
                className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-background shadow-sm ring-1 ring-border transition-transform duration-200 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {options.map(({ value, label, icon: Icon }) => {
                const isActive = view === value;

                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => onViewChange(value)}
                        className={cn(
                            'relative z-10 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon
                            aria-hidden
                            className={cn(
                                'size-4 transition-colors',
                                isActive && 'text-accent',
                            )}
                        />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
