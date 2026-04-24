import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change?: {
        value: string;
        positive: boolean;
    };
    icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
    return (
        <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{value}</span>
                {change && (
                    <div className={`flex items-center gap-1 text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {change.positive ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{change.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
}