import { BarChart3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSwitcherProps {
    view: 'kpi' | 'chart';
    onViewChange: (view: 'kpi' | 'chart') => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex gap-0.5 rounded-lg bg-muted p-0.5 sm:gap-1 sm:p-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('kpi')}
                className={`h-7 gap-1 px-2 py-1 text-xs sm:h-8 sm:gap-2 sm:px-3 sm:text-xs ${
                    view === 'kpi'
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs">KPI</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('chart')}
                className={`h-7 gap-1 px-2 py-1 text-xs sm:h-8 sm:gap-2 sm:px-3 sm:text-xs ${
                    view === 'chart'
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs">Gráfico</span>
            </Button>
        </div>
    );
}
