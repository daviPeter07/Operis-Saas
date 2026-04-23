import { BarChart3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSwitcherProps {
    view: 'kpi' | 'chart';
    onViewChange: (view: 'kpi' | 'chart') => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('kpi')}
                className={`gap-2 text-xs ${
                    view === 'kpi'
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <LayoutGrid className="h-4 w-4" />
                KPI
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange('chart')}
                className={`gap-2 text-xs ${
                    view === 'chart'
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <BarChart3 className="h-4 w-4" />
                Gráfico
            </Button>
        </div>
    );
}
