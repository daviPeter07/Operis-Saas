import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    DollarSign,
    Package,
    ShoppingCart,
    Truck,
    Users,
} from 'lucide-react';
import { EmptyState } from '@/components/table/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { withAppBasePath } from '@/constants/workspace';

interface Activity {
    id: string;
    // Database id of the sale, purchase, client, product or supplier.
    recordId: number;
    type: 'sale' | 'purchase' | 'client' | 'product' | 'supplier';
    responsible: string;
    description: string;
    amount?: string;
    time: string;
}

interface RecentActivityProps {
    activities: Activity[];
    isPending?: boolean;
}

const iconMap = {
    sale: DollarSign,
    purchase: ShoppingCart,
    client: Users,
    product: Package,
    supplier: Truck,
};

/** Module each activity opens, filtered to that record. */
const hrefMap = {
    sale: withAppBasePath('/dashboard/sales'),
    purchase: withAppBasePath('/dashboard/purchases'),
    client: withAppBasePath('/dashboard/clients'),
    product: withAppBasePath('/dashboard/inventory'),
    supplier: withAppBasePath('/dashboard/suppliers'),
};

const colorMap = {
    sale: 'text-green-600 bg-green-600/10',
    purchase: 'text-orange-600 bg-orange-600/10',
    client: 'text-blue-600 bg-blue-600/10',
    product: 'text-purple-600 bg-purple-600/10',
    supplier: 'text-cyan-600 bg-cyan-600/10',
};

export function RecentActivity({ activities, isPending }: RecentActivityProps) {
    if (isPending) {
        return (
            <div className="rounded-xl border bg-card">
                <div className="p-6 pb-4">
                    <h3 className="font-semibold">Últimas Atividades</h3>
                </div>
                <div className="space-y-3 px-6 pb-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 rounded-xl border border-border/70 px-4 py-4"
                        >
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
                        <Link
                            key={activity.id}
                            href={`${hrefMap[activity.type]}?id=${activity.recordId}`}
                            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border/70 px-4 py-4 transition-colors outline-none hover:border-accent/50 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <div className={`rounded-lg p-2 ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <p className="truncate font-medium">
                                        {activity.description}
                                    </p>
                                    <span className="hidden truncate text-xs text-muted-foreground sm:inline">
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
                            <ChevronRight
                                aria-hidden
                                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
