import { Link } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    Package,
    DollarSign,
    CreditCard,
    Users,
    ShoppingCart,
    Tag,
    ArrowRight,
    UserSearch,
} from 'lucide-react';
import { withAppBasePath } from '@/constants/workspace';
import { cn } from '@/lib/utils';

const reports = [
    {
        slug: 'vendas',
        title: 'Vendas',
        description: 'Vendas realizadas no período',
        icon: TrendingUp,
        color: 'bg-blue-500',
    },
    {
        slug: 'produtos-mais-vendidos',
        title: 'Produtos Mais Vendidos',
        description: 'Ranking dos produtos mais vendidos',
        icon: ShoppingCart,
        color: 'bg-green-500',
    },
    {
        slug: 'vendas-categoria',
        title: 'Vendas por Categoria',
        description: 'Vendas agrupadas por categoria',
        icon: Tag,
        color: 'bg-purple-500',
    },
    {
        slug: 'vendas-marca',
        title: 'Vendas por Marca',
        description: 'Vendas agrupadas por marca',
        icon: BarChart3,
        color: 'bg-indigo-500',
    },
    {
        slug: 'estoque-atual',
        title: 'Estoque Atual',
        description: 'Quantidades disponíveis em estoque',
        icon: Package,
        color: 'bg-cyan-500',
    },
    {
        slug: 'estoque-marca',
        title: 'Estoque por Marca',
        description: 'Totais de estoque por marca',
        icon: BarChart3,
        color: 'bg-teal-500',
    },
    {
        slug: 'inadimplencia',
        title: 'Inadimplência',
        description: 'Clientes com parcelas atrasadas',
        icon: DollarSign,
        color: 'bg-orange-500',
    },
    {
        slug: 'pagamentos-metodo',
        title: 'Pagamentos por Método',
        description: 'Pagamentos por método de pagamento',
        icon: CreditCard,
        color: 'bg-pink-500',
    },
    {
        slug: 'maiores-compradores',
        title: 'Maiores Compradores',
        description: 'Clientes que mais compraram',
        icon: Users,
        color: 'bg-violet-500',
    },
    {
        slug: 'comprador-especifico',
        title: 'Comprador Específico',
        description: 'Resumo e histórico por cliente',
        icon: UserSearch,
        color: 'bg-emerald-500',
    },
];

interface ReportsIndexProps {
    className?: string;
}

export function ReportsIndex({ className }: ReportsIndexProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {reports.map((report) => {
                    const Icon = report.icon;

                    return (
                        <Link
                            key={report.slug}
                            href={withAppBasePath(
                                `/dashboard/reports/${report.slug}`,
                            )}
                            className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className={cn(
                                        'flex h-11 w-11 items-center justify-center rounded-xl',
                                        report.color,
                                    )}
                                >
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold text-card-foreground">
                                    {report.title}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {report.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
