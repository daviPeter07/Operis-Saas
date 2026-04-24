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
        <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    {title}
                </span>
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{value}</span>
                {change && (
                    <div
                        className={`flex items-center gap-1 text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {change.positive ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{change.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
