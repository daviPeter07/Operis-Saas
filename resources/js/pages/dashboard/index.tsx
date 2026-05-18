import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { ChartsPanel } from '@/features/dashboard/overview/charts-panel';
import { MetricsGrid } from '@/features/dashboard/overview/metrics-grid';
import type {
    CustomRange,
    Period,
} from '@/features/dashboard/overview/period-filter';
import { PeriodFilter } from '@/features/dashboard/overview/period-filter';
import { RecentActivity } from '@/features/dashboard/overview/recent-activity';
import { ViewSwitcher } from '@/features/dashboard/overview/view-switcher';
import { PageContent } from '@/features/dashboard/page-content';
import { useAccountPayables } from '@/hooks/use-account-payables';
import { useAccountReceivables } from '@/hooks/use-account-receivables';
import { useAlertNavigationMap } from '@/hooks/use-alert-navigation-map';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { usePurchases } from '@/hooks/use-purchases';
import { useSales } from '@/hooks/use-sales';
import { useSuppliers } from '@/hooks/use-suppliers';
import AppLayout from '@/layouts/app-layout';
import {
    formatCurrencyBR,
    formatDateTimeManaus,
} from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { getDashboardGreetingForToday } from '@/utils/dashboard-greeting';
import { calculateSalesProfit } from '@/utils/sale-profit';
import { todayString } from '@/utils/sales-dialog';

function dateToLabel(date: string): string {
    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year.slice(2)}`;
}

function toActivityTimestamp(dateTime: string | undefined): number {
    if (!dateTime) {
        return 0;
    }

    // Handle "YYYY-MM-DD HH:MM:SS" format from backend
    const fullDateMatch =
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(dateTime);

    if (fullDateMatch) {
        const year = Number(fullDateMatch[1]);
        const month = Number(fullDateMatch[2]);
        const day = Number(fullDateMatch[3]);
        const hour = Number(fullDateMatch[4]);
        const minute = Number(fullDateMatch[5]);
        const second = Number(fullDateMatch[6]);

        return new Date(year, month - 1, day, hour, minute, second).getTime();
    }

    // Handle date-only "YYYY-MM-DD" format
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateTime);

    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]);
        const day = Number(dateOnlyMatch[3]);

        return new Date(year, month - 1, day, 12, 0, 0).getTime();
    }

    const parsedDate = new Date(dateTime);

    if (Number.isNaN(parsedDate.getTime())) {
        return 0;
    }

    return parsedDate.getTime();
}

export default function DashboardPage() {
    const { auth } = usePage().props as {
        auth: {
            user?: {
                name?: string;
            };
        };
    };

    const { data: sales = [], isPending: isSalesPending } = useSales();
    const { data: purchases = [], isPending: isPurchasesPending } =
        usePurchases();
    const { data: receivables = [] } = useAccountReceivables();
    const { data: payables = [] } = useAccountPayables();
    const { data: customers = [], isPending: isCustomersPending } =
        useCustomers();
    const { data: products = [], isPending: isProductsPending } = useProducts();
    const { data: suppliers = [], isPending: isSuppliersPending } =
        useSuppliers();

    const isActivitiesPending =
        isSalesPending ||
        isPurchasesPending ||
        isCustomersPending ||
        isProductsPending ||
        isSuppliersPending;

    const [view, setView] = useState<'kpi' | 'chart'>('kpi');
    const [period, setPeriod] = useState<Period>('30d');
    const [customRange, setCustomRange] = useState<CustomRange>({
        from: todayString(30),
        to: todayString(),
    });

    const userName = auth.user?.name ?? 'usuário';
    const alertNavigationMap = useAlertNavigationMap();

    const navigateByAlert = (alertId: string) => {
        const target = alertNavigationMap[alertId];

        if (!target) {
            toast.warning('Este alerta ainda não possui destino configurado.');

            return;
        }

        router.get(target.path, target.filters, {
            preserveState: true,
            replace: false,
        });
    };

    const activeSales = useMemo(
        () => sales.filter((sale) => sale.status !== 'cancelled'),
        [sales],
    );
    const activePurchases = useMemo(
        () => purchases.filter((purchase) => purchase.status !== 'cancelled'),
        [purchases],
    );
    const totalProfit = useMemo(
        () => calculateSalesProfit(activeSales),
        [activeSales],
    );

    const metrics = useMemo(() => {
        const salesTotal = activeSales.reduce(
            (sum, sale) => sum + toNumber(sale.total),
            0,
        );
        const receivableTotal = receivables
            .filter((r) => r.status !== 'received')
            .reduce((sum, r) => sum + toNumber(r.amount), 0);
        const payableTotal = payables
            .filter((p) => p.status !== 'paid')
            .reduce((sum, p) => sum + toNumber(p.amount), 0);

        return [
            {
                id: 'vendas',
                label: 'Vendas',
                value: formatCurrencyBR(salesTotal),
                icon: 'ShoppingCart',
                color: 'text-orange-500',
                iconBackground: 'bg-orange-500/12',
                iconRing: 'ring-orange-500/20',
            },
            {
                id: 'lucro',
                label: 'Lucro',
                value: formatCurrencyBR(totalProfit),
                icon: 'TrendingUp',
                color: 'text-green-600',
                iconBackground: 'bg-green-600/12',
                iconRing: 'ring-green-600/20',
            },
            {
                id: 'contas_a_receber',
                label: 'Contas a Receber',
                value: formatCurrencyBR(receivableTotal),
                icon: 'Receipt',
                color: 'text-blue-500',
                iconBackground: 'bg-blue-500/12',
                iconRing: 'ring-blue-500/20',
            },
            {
                id: 'contas_a_pagar',
                label: 'Contas a Pagar',
                value: formatCurrencyBR(payableTotal),
                icon: 'CreditCard',
                color: 'text-red-600',
                iconBackground: 'bg-red-600/12',
                iconRing: 'ring-red-600/20',
            },
        ];
    }, [activeSales, payables, receivables, totalProfit]);

    const activities = useMemo(() => {
        const userName = auth.user?.name ?? 'Usuário';

        const salesItems = [...activeSales]
            .sort(
                (a, b) =>
                    toActivityTimestamp(b.createdAt ?? b.date) -
                    toActivityTimestamp(a.createdAt ?? a.date),
            )
            .slice(0, 5)
            .map((sale) => ({
                id: `sale-${sale.id}`,
                type: 'sale' as const,
                responsible: userName,
                description: `Venda #${sale.id} - ${sale.customer_name ?? 'Sem cliente'}`,
                amount: formatCurrencyBR(sale.total),
                time: formatDateTimeManaus(sale.createdAt ?? sale.date),
                sortAt: toActivityTimestamp(sale.createdAt ?? sale.date),
            }));

        const purchaseItems = [...activePurchases]
            .sort(
                (a, b) =>
                    toActivityTimestamp(b.createdAt ?? b.date) -
                    toActivityTimestamp(a.createdAt ?? a.date),
            )
            .slice(0, 5)
            .map((purchase) => ({
                id: `purchase-${purchase.id}`,
                type: 'purchase' as const,
                responsible: userName,
                description: `Compra #${purchase.id}`,
                amount: formatCurrencyBR(purchase.total),
                time: formatDateTimeManaus(purchase.createdAt ?? purchase.date),
                sortAt: toActivityTimestamp(
                    purchase.createdAt ?? purchase.date,
                ),
            }));

        const customerItems = [...customers]
            .sort(
                (a, b) =>
                    toActivityTimestamp(
                        (b as { createdAt?: string }).createdAt,
                    ) -
                    toActivityTimestamp(
                        (a as { createdAt?: string }).createdAt,
                    ),
            )
            .slice(0, 5)
            .map((customer) => ({
                id: `client-${customer.id}`,
                type: 'client' as const,
                responsible: userName,
                description: `Novo cliente: ${customer.name}`,
                time: formatDateTimeManaus(
                    (customer as { createdAt?: string }).createdAt ?? '',
                ),
                sortAt: toActivityTimestamp(
                    (customer as { createdAt?: string }).createdAt,
                ),
            }));

        const supplierItems = [...suppliers]
            .sort(
                (a, b) =>
                    toActivityTimestamp(
                        (b as { createdAt?: string }).createdAt,
                    ) -
                    toActivityTimestamp(
                        (a as { createdAt?: string }).createdAt,
                    ),
            )
            .slice(0, 5)
            .map((supplier) => ({
                id: `supplier-${supplier.id}`,
                type: 'supplier' as const,
                responsible: userName,
                description: `Novo fornecedor: ${supplier.name}`,
                time: formatDateTimeManaus(
                    (supplier as { createdAt?: string }).createdAt ?? '',
                ),
                sortAt: toActivityTimestamp(
                    (supplier as { createdAt?: string }).createdAt,
                ),
            }));

        const productItems = [...products]
            .sort(
                (a, b) =>
                    toActivityTimestamp(
                        (b as { createdAt?: string }).createdAt,
                    ) -
                    toActivityTimestamp(
                        (a as { createdAt?: string }).createdAt,
                    ),
            )
            .slice(0, 5)
            .map((product) => ({
                id: `product-${product.id}`,
                type: 'product' as const,
                responsible: userName,
                description: `Novo produto: ${product.name}`,
                time: formatDateTimeManaus(
                    (product as { createdAt?: string }).createdAt ?? '',
                ),
                sortAt: toActivityTimestamp(
                    (product as { createdAt?: string }).createdAt,
                ),
            }));

        return [
            ...salesItems,
            ...purchaseItems,
            ...customerItems,
            ...supplierItems,
            ...productItems,
        ]
            .filter((item) => item.time)
            .sort((a, b) => b.sortAt - a.sortAt)
            .map((item) => {
                const normalized = { ...item };
                delete normalized.sortAt;

                return normalized;
            })
            .slice(0, 5);
    }, [
        activeSales,
        activePurchases,
        customers,
        suppliers,
        products,
        auth.user?.name,
    ]);

    const alerts = useMemo(
        () => [
            {
                id: 'late-payments',
                label: 'Pagamentos atrasados',
                value: payables.filter((p) => p.status === 'overdue').length,
            },
            {
                id: 'orders-to-pay',
                label: 'Pedidos a pagar',
                value: activeSales.filter((s) => s.status === 'pending').length,
            },
            {
                id: 'purchases-to-pay',
                label: 'Compras a pagar',
                value: activePurchases.filter((p) => p.status === 'pending').length,
            },
            {
                id: 'out-of-stock-products',
                label: 'Produtos sem estoque',
                value: products.filter((p) => p.stock <= 0).length,
            },
        ],
        [payables, activePurchases, activeSales, products],
    );

    const charts = useMemo(() => {
        const salesSeries = activeSales
            .slice(-12)
            .map((sale) => ({ date: sale.date, value: toNumber(sale.total) }));
        const profitSeries = activeSales.slice(-12).map((sale) => ({
            date: sale.date,
            value: calculateSalesProfit([sale]),
        }));

        return [
            {
                id: 'vendas' as const,
                title: 'Vendas no período',
                summary: formatCurrencyBR(
                    salesSeries.reduce((sum, point) => sum + point.value, 0),
                ),
                description: 'Volume de vendas conforme o filtro aplicado.',
                color: '#f97316',
                series: salesSeries.map((point) => ({
                    date: point.date,
                    label: dateToLabel(point.date),
                    value: point.value,
                })),
            },
            {
                id: 'lucro' as const,
                title: 'Lucro no período',
                summary: formatCurrencyBR(
                    profitSeries.reduce((sum, point) => sum + point.value, 0),
                ),
                description:
                    'Lucro real calculado a partir do custo dos itens vendidos.',
                color: '#22c55e',
                series: profitSeries.map((point) => ({
                    date: point.date,
                    label: dateToLabel(point.date),
                    value: point.value,
                })),
            },
        ];
    }, [activeSales]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Visão Geral', href: '/dashboard' }]}>
            <PageContent>
                <DashboardHeader
                    title={`Bem-vindo, ${userName}`}
                    description={`${getDashboardGreetingForToday()}`}
                >
                    <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
                        <ViewSwitcher view={view} onViewChange={setView} />
                        <div className="md:ml-auto">
                            <PeriodFilter
                                period={period}
                                customRange={customRange}
                                onPeriodChange={(
                                    nextPeriod,
                                    nextCustomRange,
                                ) => {
                                    setPeriod(nextPeriod);

                                    if (
                                        nextPeriod === 'custom' &&
                                        nextCustomRange
                                    ) {
                                        setCustomRange(nextCustomRange);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </DashboardHeader>

                {view === 'kpi' ? (
                    <div className="grid gap-6">
                        <MetricsGrid metrics={metrics} />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <RecentActivity
                                    activities={activities}
                                    isPending={isActivitiesPending}
                                />
                            </div>
                            <div className="rounded-xl border bg-card p-4">
                                <h3 className="mb-4 font-semibold">
                                    Alertas e lembretes
                                </h3>
                                <div className="space-y-4">
                                    {alerts.map((alert) => (
                                        <button
                                            type="button"
                                            key={alert.id}
                                            onClick={() =>
                                                navigateByAlert(alert.id)
                                            }
                                            className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                                        >
                                            <span className="text-sm font-medium text-foreground">
                                                {alert.label}
                                            </span>
                                            <span
                                                className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                    alert.value > 0
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-muted text-foreground'
                                                }`}
                                            >
                                                {alert.value}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <ChartsPanel charts={charts} />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <RecentActivity
                                    activities={activities}
                                    isPending={isActivitiesPending}
                                />
                            </div>
                            <div className="rounded-xl border bg-card p-4">
                                <h3 className="mb-4 font-semibold">
                                    Alertas e lembretes
                                </h3>
                                <div className="space-y-4">
                                    {alerts.map((alert) => (
                                        <button
                                            type="button"
                                            key={alert.id}
                                            onClick={() =>
                                                navigateByAlert(alert.id)
                                            }
                                            className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                                        >
                                            <span className="text-sm font-medium text-foreground">
                                                {alert.label}
                                            </span>
                                            <span
                                                className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                    alert.value > 0
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-muted text-foreground'
                                                }`}
                                            >
                                                {alert.value}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PageContent>
        </AppLayout>
    );
}
