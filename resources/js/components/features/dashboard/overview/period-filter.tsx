import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type Period = '7d' | '30d' | '90d' | '12m';

interface PeriodFilterProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
}

const periodLabels: Record<Period, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '12m': 'Últimos 12 meses',
};

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(!open)}
                className="gap-2 text-xs"
            >
                {periodLabels[period]}
                <ChevronDown className="h-4 w-4" />
            </Button>

            {open && (
                <div className="absolute top-full mt-2 right-0 bg-card border rounded-lg shadow-lg py-2 z-50 min-w-40">
                    {(['7d', '30d', '90d', '12m'] as Period[]).map((p) => (
                        <button
                            key={p}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-muted ${
                                period === p ? 'font-medium text-accent' : ''
                            }`}
                            onClick={() => {
                                onPeriodChange(p);
                                setOpen(false);
                            }}
                        >
                            {periodLabels[p]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
