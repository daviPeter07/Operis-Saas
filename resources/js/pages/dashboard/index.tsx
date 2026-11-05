import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { AlertsPanel } from '@/features/dashboard/overview/alerts-panel';
import { ChartsPanel } from '@/features/dashboard/overview/charts-panel';
import { MetricsGrid } from '@/features/dashboard/overview/metrics-grid';
import type { Metric } from '@/features/dashboard/overview/metrics-grid';
import type {
    CustomRange,
    Period,
} from '@/features/dashboard/overview/period-filter';
import {
    PeriodFilter,
    periodLabels,
} from '@/features/dashboard/overview/period-filter';
import {
    bucketKeyFor,
    buildSeriesBuckets,
    comparePeriods,
    formatRangeLabel,
    getCurrentMonthRange,
    normalizeDateString,
    resolveDateRange,
    resolvePreviousRange,
} from '@/features/dashboard/overview/period-range';
import type { DateRange } from '@/features/dashboard/overview/period-range';
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
import { nowInAppTimeZone, todayInAppTimeZone } from '@/lib/app-timezone';
import { formatCurrencyBR, formatDateTimeManaus } from '@/lib/format';
import { toNumber } from '@/services/normalizers';
import { getDashboardGreetingForToday } from '@/utils/dashboard-greeting';
import { calculateSalesProfit } from '@/utils/sale-profit';

type DatedSale = { date?: string | null; createdAt?: string | null };

function saleDateOf(sale: DatedSale): string | null {
    return normalizeDateString(sale.date ?? sale.createdAt);
}

function isWithinRange(date: string | null, range: DateRange): boolean {
    return date !== null && date >= range.from && date <= range.to;
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

type KpiFeedback = Pick<Metric, 'trend' | 'detail'>;

interface KpiFeedbackInput {
    salesCount: number;
    salesTotal: number;
    profit: number;
    previousSalesTotal: number;
    previousProfit: number;
    /** e.g. "no mês passado"; null when the period has nothing to compare with. */
    previousPeriodName: string | null;
    comparisonLabel: string;
}

function formatSalesCount(count: number): string {
    return `${count} ${count === 1 ? 'venda' : 'vendas'}`;
}

function formatMargin(profit: number, salesTotal: number): string {
    const margin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

    return `Margem de ${margin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

/** Growth vs. the previous period when it can be measured, otherwise a useful fact. */
function salesFeedback(input: KpiFeedbackInput): KpiFeedback {
    if (input.salesCount === 0) {
        return {
            detail: { text: 'Nenhuma venda no período', tone: 'neutral' },
        };
    }

    if (input.previousPeriodName === null) {
        return {
            detail: {
                text: `${formatSalesCount(input.salesCount)} no período`,
                tone: 'neutral',
            },
        };
    }

    if (input.previousSalesTotal === 0) {
        return {
            detail: {
                text: `${formatSalesCount(input.salesCount)}, nenhuma ${input.previousPeriodName}`,
                tone: 'neutral',
            },
        };
    }

    return {
        trend: {
            ...comparePeriods(input.salesTotal, input.previousSalesTotal),
            comparisonLabel: input.comparisonLabel,
        },
    };
}

function profitFeedback(input: KpiFeedbackInput): KpiFeedback {
    if (input.salesCount === 0) {
        return {
            detail: {
                text: 'Sem vendas para calcular o lucro',
                tone: 'neutral',
            },
        };
    }

    const margin = formatMargin(input.profit, input.salesTotal);

    if (input.previousPeriodName === null) {
        return {
            detail: { text: `${margin} sobre as vendas`, tone: 'neutral' },
        };
    }

    if (input.previousProfit === 0) {
        return {
            detail: {
                text: `${margin}, sem lucro ${input.previousPeriodName}`,
                tone: 'neutral',
            },
        };
    }

    return {
        trend: {
            ...comparePeriods(input.profit, input.previousProfit),
            comparisonLabel: input.comparisonLabel,
        },
    };
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
    const [period, setPeriod] = useState<Period>('current-month');
    const [customRange, setCustomRange] = useState<CustomRange>(
        getCurrentMonthRange(nowInAppTimeZone()),
    );

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
    const salesRange = useMemo(
        () => resolveDateRange(period, customRange, nowInAppTimeZone()),
        [customRange, period],
    );
    const salesInPeriod = useMemo(() => {
        if (!salesRange) {
            return activeSales;
        }

        return activeSales.filter((sale) =>
            isWithinRange(saleDateOf(sale), salesRange),
        );
    }, [activeSales, salesRange]);
    const totalProfit = useMemo(
        () => calculateSalesProfit(salesInPeriod),
        [salesInPeriod],
    );
    const previousRange = useMemo(
        () => resolvePreviousRange(period, salesRange),
        [period, salesRange],
    );
    const salesInPreviousPeriod = useMemo(
        () =>
            previousRange
                ? activeSales.filter((sale) =>
                      isWithinRange(saleDateOf(sale), previousRange),
                  )
                : [],
        [activeSales, previousRange],
    );
    const periodLabel = useMemo(() => {
        const name = periodLabels[period];

        return salesRange ? `${name}: ${formatRangeLabel(salesRange)}` : name;
    }, [period, salesRange]);

    const metrics = useMemo((): Metric[] => {
        const today = todayInAppTimeZone();
        const salesTotal = salesInPeriod.reduce(
            (sum, sale) => sum + toNumber(sale.total),
            0,
        );
        const openReceivables = receivables.filter(
            (r) => r.status !== 'received' && r.status !== 'cancelled',
        );
        const openPayables = payables.filter(
            (p) => p.status !== 'paid' && p.status !== 'cancelled',
        );
        const receivableTotal = openReceivables.reduce(
            (sum, r) => sum + toNumber(r.amount),
            0,
        );
        const payableTotal = openPayables.reduce(
            (sum, p) => sum + toNumber(p.amount),
            0,
        );
        const overdueReceivables = openReceivables.filter(
            (r) => r.due_date !== null && r.due_date.slice(0, 10) < today,
        ).length;
        const overduePayables = openPayables.filter(
            (p) => p.due_date !== null && p.due_date.slice(0, 10) < today,
        ).length;
        const feedbackInput: KpiFeedbackInput = {
            salesCount: salesInPeriod.length,
            salesTotal,
            profit: totalProfit,
            previousSalesTotal: salesInPreviousPeriod.reduce(
                (sum, sale) => sum + toNumber(sale.total),
                0,
            ),
            previousProfit: calculateSalesProfit(salesInPreviousPeriod),
            previousPeriodName: previousRange
                ? period === 'current-month'
                    ? 'no mês passado'
                    : 'no período anterior'
                : null,
            comparisonLabel:
                period === 'current-month'
                    ? 'vs. mês passado'
                    : 'vs. período anterior',
        };
        const overdueDetail = (count: number) =>
            count > 0
                ? {
                      text: `${count} ${count === 1 ? 'vencida' : 'vencidas'}`,
                      tone: 'warning' as const,
                  }
                : { text: 'Nenhuma vencida', tone: 'neutral' as const };

        return [
            {
                id: 'vendas',
                label: 'Vendas',
                value: formatCurrencyBR(salesTotal),
                icon: 'ShoppingCart',
                color: 'text-orange-500',
                iconBackground: 'bg-orange-500/12',
                iconRing: 'ring-orange-500/20',
                ...salesFeedback(feedbackInput),
            },
            {
                id: 'lucro',
                label: 'Lucro',
                value: formatCurrencyBR(totalProfit),
                icon: 'TrendingUp',
                color: 'text-green-600',
                iconBackground: 'bg-green-600/12',
                iconRing: 'ring-green-600/20',
                ...profitFeedback(feedbackInput),
            },
            {
                id: 'contas_a_receber',
                label: 'Contas a Receber',
                value: formatCurrencyBR(receivableTotal),
                icon: 'Receipt',
                color: 'text-blue-500',
                iconBackground: 'bg-blue-500/12',
                iconRing: 'ring-blue-500/20',
                detail: overdueDetail(overdueReceivables),
            },
            {
                id: 'contas_a_pagar',
                label: 'Contas a Pagar',
                value: formatCurrencyBR(payableTotal),
                icon: 'CreditCard',
                color: 'text-red-600',
                iconBackground: 'bg-red-600/12',
                iconRing: 'ring-red-600/20',
                detail: overdueDetail(overduePayables),
            },
        ];
    }, [
        payables,
        period,
        previousRange,
        receivables,
        salesInPeriod,
        salesInPreviousPeriod,
        totalProfit,
    ]);

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
            .map((item) => ({
                id: item.id,
                type: item.type,
                responsible: item.responsible,
                description: item.description,
                time: item.time,
                ...('amount' in item ? { amount: item.amount } : {}),
            }))
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
                value: activePurchases.filter((p) => p.status === 'pending')
                    .length,
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
        const datedSales = salesInPeriod
            .map((sale) => ({ sale, date: saleDateOf(sale) }))
            .filter(
                (
                    entry,
                ): entry is {
                    sale: (typeof salesInPeriod)[number];
                    date: string;
                } => entry.date !== null,
            );
        const sortedDates = datedSales.map((entry) => entry.date).sort();
        const chartRange =
            salesRange ??
            (sortedDates.length > 0
                ? {
                      from: sortedDates[0],
                      to: sortedDates[sortedDates.length - 1],
                  }
                : null);
        const buckets = chartRange ? buildSeriesBuckets(chartRange) : [];
        const salesByBucket = new Map<string, number>();
        const profitByBucket = new Map<string, number>();

        for (const { sale, date } of datedSales) {
            const key = bucketKeyFor(date, buckets);
            salesByBucket.set(
                key,
                (salesByBucket.get(key) ?? 0) + toNumber(sale.total),
            );
            profitByBucket.set(
                key,
                (profitByBucket.get(key) ?? 0) + calculateSalesProfit([sale]),
            );
        }

        const toSeries = (values: Map<string, number>) =>
            buckets.map((bucket) => ({
                key: bucket.key,
                label: bucket.label,
                value: values.get(bucket.key) ?? 0,
            }));

        return [
            {
                id: 'vendas' as const,
                title: 'Vendas no período',
                summary: formatCurrencyBR(
                    datedSales.reduce(
                        (sum, { sale }) => sum + toNumber(sale.total),
                        0,
                    ),
                ),
                color: '#f97316',
                series: toSeries(salesByBucket),
            },
            {
                id: 'lucro' as const,
                title: 'Lucro no período',
                summary: formatCurrencyBR(totalProfit),
                color: '#22c55e',
                series: toSeries(profitByBucket),
            },
        ];
    }, [salesInPeriod, salesRange, totalProfit]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Visão Geral', href: '/dashboard' }]}>
            <PageContent>
                <DashboardHeader
                    title={`Bem-vindo, ${userName}`}
                    description={`${getDashboardGreetingForToday()}`}
                >
                    <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <ViewSwitcher view={view} onViewChange={setView} />
                        <div className="min-w-0 sm:ml-auto">
                            <PeriodFilter
                                period={period}
                                customRange={customRange}
                                periodOptions={[
                                    'current-month',
                                    '7d',
                                    '30d',
                                    '90d',
                                    '12m',
                                    'next-month',
                                    'all',
                                ]}
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
                            <AlertsPanel
                                alerts={alerts}
                                onSelect={navigateByAlert}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <ChartsPanel
                            charts={charts}
                            periodLabel={periodLabel}
                        />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <RecentActivity
                                    activities={activities}
                                    isPending={isActivitiesPending}
                                />
                            </div>
                            <AlertsPanel
                                alerts={alerts}
                                onSelect={navigateByAlert}
                            />
                        </div>
                    </div>
                )}
            </PageContent>
        </AppLayout>
    );
}
