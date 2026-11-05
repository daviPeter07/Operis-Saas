import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DatePickerInput } from '@/components/date/date-picker-input';
import { Button } from '@/components/ui/button';
import { nowInAppTimeZone } from '@/lib/app-timezone';
import { cn } from '@/lib/utils';
import { resolveDateRange } from './period-range';

export type Period =
    | 'current-month'
    | '7d'
    | '30d'
    | '90d'
    | '12m'
    | 'next-month'
    | 'all'
    | 'custom';

export interface CustomRange {
    from: string;
    to: string;
}

interface PeriodFilterProps {
    period: Period;
    customRange: CustomRange;
    onPeriodChange: (period: Period, customRange?: CustomRange) => void;
    periodOptions?: Period[];
}

export const periodLabels: Record<Period, string> = {
    'current-month': 'Mês atual',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '12m': 'Últimos 12 meses',
    'next-month': 'Próximo mês',
    all: 'Todo período',
    custom: 'Personalizado',
};

/** Every preset, in the order shown in the picker (used by all tables). */
export const allPeriodOptions: Period[] = [
    'all',
    'current-month',
    '7d',
    '30d',
    '90d',
    '12m',
    'next-month',
];

const toShortDate = (value: string) =>
    `${value.slice(8, 10)}/${value.slice(5, 7)}`;

/**
 * Period picker for the overview. Presets apply as soon as they are clicked;
 * a custom range only applies through "Aplicar período", which stays disabled
 * until the dates are changed and valid.
 */
export function PeriodFilter({
    period,
    customRange,
    onPeriodChange,
    periodOptions = allPeriodOptions,
}: PeriodFilterProps) {
    const [open, setOpen] = useState(false);
    const [initialRange, setInitialRange] = useState<CustomRange>(customRange);
    const [draftRange, setDraftRange] = useState<CustomRange>(customRange);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const toggleOpen = () => {
        if (!open) {
            // Start the custom fields with the dates of the period in use.
            const currentRange = resolveDateRange(
                period,
                customRange,
                nowInAppTimeZone(),
            ) ?? {
                from: '',
                to: '',
            };
            setInitialRange(currentRange);
            setDraftRange(currentRange);
        }

        setOpen((value) => !value);
    };

    const currentLabel =
        period === 'custom' && customRange.from && customRange.to
            ? `${toShortDate(customRange.from)} a ${toShortDate(customRange.to)}`
            : periodLabels[period];

    const hasChanges =
        draftRange.from !== initialRange.from ||
        draftRange.to !== initialRange.to;
    const isComplete = Boolean(draftRange.from && draftRange.to);
    const isOrdered = !isComplete || draftRange.from <= draftRange.to;
    const canApply = hasChanges && isComplete && isOrdered;

    return (
        <div className="relative w-full sm:w-auto" ref={containerRef}>
            <Button
                variant="outline"
                onClick={toggleOpen}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="h-10 w-full gap-1.5 px-3 text-sm font-medium sm:h-9 sm:w-auto"
            >
                <CalendarDays
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex-1 truncate text-left">
                    {currentLabel}
                </span>
                <ChevronDown
                    aria-hidden
                    className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </Button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Escolher período"
                    className="absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border bg-card shadow-xl sm:left-auto sm:w-[34rem]"
                >
                    <div className="grid sm:grid-cols-[12rem_1fr]">
                        <div className="py-2 sm:border-r sm:py-3">
                            <p className="hidden px-4 pb-2 text-xs font-medium text-muted-foreground sm:block">
                                Períodos prontos
                            </p>
                            {periodOptions.map((item) => {
                                const isSelected = period === item;

                                return (
                                    <button
                                        type="button"
                                        key={item}
                                        className={cn(
                                            'flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted',
                                            isSelected
                                                ? 'font-medium text-accent'
                                                : 'text-foreground',
                                        )}
                                        onClick={() => {
                                            onPeriodChange(item);
                                            setOpen(false);
                                        }}
                                    >
                                        {periodLabels[item]}
                                        {isSelected && (
                                            <Check
                                                aria-hidden
                                                className="size-4 shrink-0"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t p-4 sm:border-t-0">
                            <p className="text-sm font-medium text-foreground">
                                Período personalizado
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Altere as datas e clique em aplicar.
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                        De
                                    </span>
                                    <DatePickerInput
                                        value={draftRange.from}
                                        onChange={(from) =>
                                            setDraftRange((current) => ({
                                                ...current,
                                                from,
                                            }))
                                        }
                                        placeholder="Data inicial"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                        Até
                                    </span>
                                    <DatePickerInput
                                        value={draftRange.to}
                                        onChange={(to) =>
                                            setDraftRange((current) => ({
                                                ...current,
                                                to,
                                            }))
                                        }
                                        placeholder="Data final"
                                        align="end"
                                    />
                                </div>
                            </div>

                            {!isOrdered && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    A data inicial precisa ser antes da data
                                    final.
                                </p>
                            )}

                            <Button
                                className="mt-4 w-full"
                                onClick={() => {
                                    onPeriodChange('custom', draftRange);
                                    setOpen(false);
                                }}
                                disabled={!canApply}
                            >
                                Aplicar período
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
