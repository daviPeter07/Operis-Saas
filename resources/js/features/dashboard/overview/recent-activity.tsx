import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { EmptyState } from '@/components/table/empty-state';

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
    if (activities.length === 0) {
        return (
            <div className="rounded-xl border bg-card">
                <div className="p-6 pb-4">
                    <h3 className="font-semibold">Últimas Atividades</h3>
                </div>

                <div className="px-6 pb-6">
                    <EmptyState
                        title="Você ainda não tem atividades"
                        description="Crie uma venda, compra, cliente ou produto para começar a alimentar essa área."
                        action={{
                            label: 'Ir para Vendas',
                            href: '/dashboard/sales',
                        }}
                        className="py-6"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card">
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
                            <div className={`rounded-lg p-2 ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <p className="truncate font-medium">
                                        {activity.description}
                                    </p>
                                    <span className="truncate text-xs text-muted-foreground">
                                        por {activity.responsible}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                            {activity.amount && (
                                <span className="text-sm font-semibold text-accent">
                                    {activity.amount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
