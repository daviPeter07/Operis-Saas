import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface Activity {
    id: string;
    type: 'sale' | 'purchase' | 'client' | 'product';
    responsible: string;
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
            <div className="space-y-3 px-6 pb-6">
                {activities.map((activity) => {
                    const Icon = iconMap[activity.type];
                    const colorClass = colorMap[activity.type];

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 rounded-xl border border-border/70 px-4 py-4 transition-colors hover:bg-muted/30"
                        >
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                    <p className="truncate font-medium">{activity.description}</p>
                                    <span className="truncate text-xs text-muted-foreground">
                                        por {activity.responsible}
                                    </span>
                                </div>
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
