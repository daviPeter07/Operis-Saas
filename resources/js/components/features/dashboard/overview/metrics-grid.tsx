import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Metric {
    id: string;
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
}

interface MetricsGridProps {
    metrics: Metric[];
}

const iconMap: Record<string, typeof DollarSign> = {
    TrendingUp: TrendingUp,
    Users: Users,
    ShoppingCart: ShoppingCart,
    Package: Package,
    DollarSign: DollarSign,
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
                const Icon = iconMap[metric.id === 'revenue' ? 'DollarSign' : metric.icon] || DollarSign;
                const isPositive = metric.trend === 'up';

                return (
                    <Card key={metric.id} className="bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {metric.label}
                                </span>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-bold">{metric.value}</span>
                                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    <span>{Math.abs(metric.change)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}