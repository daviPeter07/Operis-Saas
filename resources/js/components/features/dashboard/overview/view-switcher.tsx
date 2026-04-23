import { BarChart3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSwitcherProps {
    view: 'kpi' | 'chart';
    onViewChange: (view: 'kpi' | 'chart') => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
                variant={view === 'kpi' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('kpi')}
                className="gap-2"
            >
                <LayoutGrid className="h-4 w-4" />
                KPI
            </Button>
            <Button
                variant={view === 'chart' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('chart')}
                className="gap-2"
            >
                <BarChart3 className="h-4 w-4" />
                Gráfico
            </Button>
        </div>
    );
}