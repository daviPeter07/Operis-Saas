import { Link } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    Package,
    AlertTriangle,
    XCircle,
    DollarSign,
    CreditCard,
    Users,
    MapPin,
    ShoppingCart,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const reports = [
    {
        slug: 'vendas',
        title: 'Vendas',
        description: 'Vendas realizadas em determinado período',
        icon: TrendingUp,
        color: 'bg-blue-500',
    },
    {
        slug: 'produtos-mais-vendidos',
        title: 'Produtos Mais Vendidos',
        description: 'Produtos mais vendidos em determinado período',
        icon: ShoppingCart,
        color: 'bg-green-500',
    },
    {
        slug: 'vendas-categoria',
        title: 'Vendas por Categoria',
        description: 'Vendas agrupadas por categoria de produto',
        icon: Tag,
        color: 'bg-purple-500',
    },
    {
        slug: 'vendas-marca',
        title: 'Vendas por Marca',
        description: 'Vendas agrupadas por marca de produto',
        icon: BarChart3,
        color: 'bg-indigo-500',
    },
    {
        slug: 'estoque-atual',
        title: 'Estoque Atual',
        description: 'Quantidades disponíveis em estoque para cada produto',
        icon: Package,
        color: 'bg-cyan-500',
    },
    {
        slug: 'estoque-marca',
        title: 'Estoque por Marca',
        description:
            'Totais de estoque agrupados por marca com valor de custo, venda e lucro estimado',
        icon: BarChart3,
        color: 'bg-teal-500',
    },
    {
        slug: 'proximos-vencer',
        title: 'Próximos de Vencer',
        description: 'Produtos próximos de vencer em determinado período',
        icon: AlertTriangle,
        color: 'bg-yellow-500',
    },
    {
        slug: 'perdas',
        title: 'Perdas',
        description:
            'Quantidade de baixas por motivo (vencimento, quebra, perda, etc.)',
        icon: XCircle,
        color: 'bg-red-500',
    },
    {
        slug: 'inadimplencia',
        title: 'Inadimplência por Cliente',
        description: 'Total devido por cada cliente com parcelas em atraso',
        icon: DollarSign,
        color: 'bg-orange-500',
    },
    {
        slug: 'pagamentos-metodo',
        title: 'Pagamentos por Método',
        description:
            'Quantidade de pagamentos realizados em cada método no período',
        icon: CreditCard,
        color: 'bg-pink-500',
    },
    {
        slug: 'maiores-compradores',
        title: 'Maiores Compradores',
        description: 'Clientes que mais compraram em determinado período',
        icon: Users,
        color: 'bg-violet-500',
    },
    {
        slug: 'clientes-cidade',
        title: 'Clientes por Cidade',
        description: 'Lista de clientes filtrados por cidade',
        icon: MapPin,
        color: 'bg-emerald-500',
    },
];

interface ReportsIndexProps {
    className?: string;
}

export function ReportsIndex({ className }: ReportsIndexProps) {
    return (
        <div
            className={cn(
                'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
                className,
            )}
        >
            {reports.map((report) => {
                const Icon = report.icon;
                return (
                    <Link
                        key={report.slug}
                        href={`/dashboard/reports/${report.slug}`}
                        className="group block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg',
                                    report.color,
                                )}
                            >
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium group-hover:text-primary">
                                    {report.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {report.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
