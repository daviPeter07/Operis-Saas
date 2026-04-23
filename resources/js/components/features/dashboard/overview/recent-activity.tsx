import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface Activity {
    id: string;
    type: 'sale' | 'purchase' | 'client' | 'product';
    description: string;
    amount?: string;
    time: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

const iconMap = {
    sale: DollarSign,
    purchase: ShoppingCart,
    client: Users,
    product: Package,
};

const colorMap = {
    sale: 'text-green-600 bg-green-600/10',
    purchase: 'text-orange-600 bg-orange-600/10',
    client: 'text-blue-600 bg-blue-600/10',
    product: 'text-purple-600 bg-purple-600/10',
};

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <div className="bg-card rounded-xl border">
            <div className="p-6 pb-4">
                <h3 className="font-semibold">Últimas Atividades</h3>
            </div>
            <div className="divide-y">
                {activities.map((activity) => {
                    const Icon = iconMap[activity.type];
                    const colorClass = colorMap[activity.type];

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activity.description}</p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            {activity.amount && (
                                <span className="text-sm font-semibold text-accent">{activity.amount}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}