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
    ChevronRight,
    UserSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const reportCategories = [
    {
        category: 'Vendas',
        color: 'bg-orange-500',
        reports: [
            {
                slug: 'vendas',
                title: 'Vendas',
                description: 'Vendas realizadas no período',
                icon: TrendingUp,
            },
            {
                slug: 'produtos-mais-vendidos',
                title: 'Produtos Mais Vendidos',
                description: 'Ranking dos produtos mais vendidos',
                icon: ShoppingCart,
            },
            {
                slug: 'vendas-categoria',
                title: 'Vendas por Categoria',
                description: 'Vendas agrupadas por categoria',
                icon: Tag,
            },
            {
                slug: 'vendas-marca',
                title: 'Vendas por Marca',
                description: 'Vendas agrupadas por marca',
                icon: BarChart3,
            },
        ],
    },
    {
        category: 'Estoque',
        color: 'bg-orange-500',
        reports: [
            {
                slug: 'estoque-atual',
                title: 'Estoque Atual',
                description: 'Quantidades disponíveis em estoque',
                icon: Package,
            },
            {
                slug: 'estoque-marca',
                title: 'Estoque por Marca',
                description: 'Totais de estoque por marca',
                icon: BarChart3,
            },
        ],
    },
    {
        category: 'Financeiro',
        color: 'bg-orange-500',
        reports: [
            {
                slug: 'pagamentos-metodo',
                title: 'Pagamentos por Método',
                description: 'Pagamentos por método de pagamento',
                icon: CreditCard,
            },
            {
                slug: 'inadimplencia',
                title: 'Inadimplência',
                description: 'Clientes com parcelas atrasadas',
                icon: DollarSign,
            },
        ],
    },
    {
        category: 'Clientes',
        color: 'bg-orange-500',
        reports: [
            {
                slug: 'maiores-compradores',
                title: 'Maiores Compradores',
                description: 'Clientes que mais compraram',
                icon: Users,
            },
            {
                slug: 'comprador-especifico',
                title: 'Comprador Específico',
                description: 'Histórico e resumo por comprador',
                icon: UserSearch,
            },
        ],
    },
];

export function ReportsModule() {
    return (
        <div className="space-y-8">
            {reportCategories.map((category) => (
                <div key={category.category}>
                    <div className="mb-3 flex items-center gap-2">
                        <span
                            className={cn(
                                'h-3 w-3 rounded-full',
                                category.color,
                            )}
                        />
                        <h2 className="text-lg font-semibold">
                            {category.category}
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {category.reports.map((report) => {
                            const Icon = report.icon;

                            return (
                                <Link
                                    key={report.slug}
                                    href={`/dashboard/reports/${report.slug}`}
                                    className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-card-foreground">
                                            {report.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {report.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
