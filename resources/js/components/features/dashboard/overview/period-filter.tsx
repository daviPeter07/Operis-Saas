import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export type Period = '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

export interface CustomRange {
    from: string;
    to: string;
}

interface PeriodFilterProps {
    period: Period;
    customRange: CustomRange;
    onPeriodChange: (period: Period, customRange?: CustomRange) => void;
}

const periodLabels: Record<Period, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '12m': 'Últimos 12 meses',
    all: 'Todo período',
    custom: 'Personalizado',
};

export function PeriodFilter({ period, customRange, onPeriodChange }: PeriodFilterProps) {
    const [open, setOpen] = useState(false);
    const [draftRange, setDraftRange] = useState<CustomRange>(customRange);

    useEffect(() => {
        setDraftRange(customRange);
    }, [customRange]);

    const currentLabel =
        period === 'custom' && customRange.from && customRange.to
            ? `${customRange.from} - ${customRange.to}`
            : periodLabels[period];

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen((value) => !value)}
                className="gap-2 text-xs"
            >
                {currentLabel}
                <ChevronDown className="h-4 w-4" />
            </Button>

            {open && (
                <div className="absolute top-full right-0 z-50 mt-2 min-w-56 rounded-lg border bg-card py-2 shadow-lg">
                    {(['7d', '30d', '90d', '12m', 'all'] as Period[]).map((item) => (
                        <button
                            key={item}
                            className={`w-full px-4 py-2 text-left text-xs hover:bg-muted ${
                                period === item ? 'font-medium text-accent' : ''
                            }`}
                            onClick={() => {
                                onPeriodChange(item);
                                setOpen(false);
                            }}
                        >
                            {periodLabels[item]}
                        </button>
                    ))}

                    <div className="mx-4 my-2 h-px bg-border" />

                    <div className="px-4 pb-2">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Personalizado
                        </p>
                        <div className="space-y-2">
                            <input
                                type="date"
                                value={draftRange.from}
                                onChange={(event) =>
                                    setDraftRange((current) => ({
                                        ...current,
                                        from: event.target.value,
                                    }))
                                }
                                className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none ring-0"
                            />
                            <input
                                type="date"
                                value={draftRange.to}
                                onChange={(event) =>
                                    setDraftRange((current) => ({
                                        ...current,
                                        to: event.target.value,
                                    }))
                                }
                                className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none ring-0"
                            />
                            <Button
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                    onPeriodChange('custom', draftRange);
                                    setOpen(false);
                                }}
                                disabled={!draftRange.from || !draftRange.to}
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
