export type OverviewPeriod = '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

export interface Metric {
    id: string;
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: string;
    color: string;
    iconBackground: string;
    iconRing: string;
}

export interface Activity {
    id: string;
    type: 'sale' | 'purchase' | 'client' | 'product';
    responsible: string;
    description: string;
    amount?: string;
    time: string;
}

export interface Alert {
    id: string;
    label: string;
    value: number;
}

export interface ChartPoint {
    date: string;
    label: string;
    value: number;
}

export interface OverviewChart {
    id: 'vendas' | 'lucro';
    title: string;
    summary: string;
    description: string;
    color: string;
    series: ChartPoint[];
}

export interface CustomRange {
    from: string;
    to: string;
}

export const metrics: Metric[] = [
    {
        id: 'vendas',
        label: 'Vendas',
        value: 'R$ 45.230',
        change: 12.5,
        trend: 'up',
        icon: 'ShoppingCart',
        color: 'text-orange-500',
        iconBackground: 'bg-orange-500/12',
        iconRing: 'ring-orange-500/20',
    },
    {
        id: 'lucro',
        label: 'Lucro',
        value: 'R$ 12.450',
        change: 8.2,
        trend: 'up',
        icon: 'TrendingUp',
        color: 'text-green-600',
        iconBackground: 'bg-green-600/12',
        iconRing: 'ring-green-600/20',
    },
    {
        id: 'contas_a_receber',
        label: 'Contas a Receber',
        value: 'R$ 28.900',
        change: -3.1,
        trend: 'down',
        icon: 'Receipt',
        color: 'text-blue-500',
        iconBackground: 'bg-blue-500/12',
        iconRing: 'ring-blue-500/20',
    },
    {
        id: 'contas_a_pagar',
        label: 'Contas a Pagar',
        value: 'R$ 15.670',
        change: 5.7,
        trend: 'up',
        icon: 'CreditCard',
        color: 'text-red-600',
        iconBackground: 'bg-red-600/12',
        iconRing: 'ring-red-600/20',
    },
];

export const recentActivity: Activity[] = [
    {
        id: '1',
        type: 'sale',
        responsible: 'Gabriela',
        description: 'Venda para Maria Silva',
        amount: 'R$ 2.450,00',
        time: 'há 5 min',
    },
    {
        id: '2',
        type: 'client',
        responsible: 'Marcos',
        description: 'Novo cliente cadastrado',
        amount: undefined,
        time: 'há 23 min',
    },
    {
        id: '3',
        type: 'purchase',
        responsible: 'Fernanda',
        description: 'Compra de Fornecedor ABC',
        amount: 'R$ 1.200,00',
        time: 'há 1h',
    },
    {
        id: '4',
        type: 'product',
        responsible: 'Carlos',
        description: 'Produto atualizado',
        amount: undefined,
        time: 'há 2h',
    },
    {
        id: '5',
        type: 'sale',
        responsible: 'Juliana',
        description: 'Venda para João Santos',
        amount: 'R$ 890,00',
        time: 'há 3h',
    },
];

export const alerts: Alert[] = [
    {
        id: 'late-payments',
        label: 'Pagamentos atrasados',
        value: 153,
    },
    {
        id: 'undelivered-orders',
        label: 'Pedidos não entregues',
        value: 7,
    },
    {
        id: 'orders-to-confirm',
        label: 'Pedidos a confirmar',
        value: 12,
    },
    {
        id: 'out-of-stock-products',
        label: 'Produtos sem estoque',
        value: 4,
    },
];

const fullSalesSeries = generateDailySeries(
    '2025-01-01',
    '2026-04-23',
    980,
    1650,
);
const fullProfitSeries = generateDailySeries(
    '2025-01-01',
    '2026-04-23',
    260,
    520,
);

export function getOverviewCharts(
    period: OverviewPeriod,
    customRange?: CustomRange,
): OverviewChart[] {
    const salesSeries = formatSeriesForPeriod(
        fullSalesSeries,
        period,
        customRange,
    );
    const profitSeries = formatSeriesForPeriod(
        fullProfitSeries,
        period,
        customRange,
    );

    return [
        {
            id: 'vendas',
            title: 'Vendas no período',
            summary: formatCurrency(sumSeries(salesSeries)),
            description: 'Volume de vendas conforme o filtro aplicado.',
            color: '#f97316',
            series: salesSeries,
        },
        {
            id: 'lucro',
            title: 'Lucro no período',
            summary: formatCurrency(sumSeries(profitSeries)),
            description: 'Evolução do lucro com base no mesmo período.',
            color: '#22c55e',
            series: profitSeries,
        },
    ];
}

function generateDailySeries(
    startDate: string,
    endDate: string,
    base: number,
    variance: number,
): ChartPoint[] {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const points: ChartPoint[] = [];
    let index = 0;

    for (
        let current = new Date(start);
        current <= end;
        current.setDate(current.getDate() + 1)
    ) {
        const waveA = Math.sin(index / 4.5) * variance * 0.32;
        const waveB = Math.cos(index / 9) * variance * 0.18;
        const trend = index * 1.9;
        const value = Math.max(Math.round(base + waveA + waveB + trend), 80);

        points.push({
            date: formatDateKey(current),
            label: formatLabel(current),
            value,
        });

        index += 1;
    }

    return points;
}

function formatSeriesForPeriod(
    series: ChartPoint[],
    period: OverviewPeriod,
    customRange?: CustomRange,
): ChartPoint[] {
    const filtered = filterSeriesByPeriod(series, period, customRange);

    if (period === '7d') {
        return filtered;
    }

    if (period === '30d') {
        return reduceByStep(filtered, 4);
    }

    if (period === '90d') {
        return reduceByStep(filtered, 10);
    }

    return groupByMonth(filtered);
}

function filterSeriesByPeriod(
    series: ChartPoint[],
    period: OverviewPeriod,
    customRange?: CustomRange,
): ChartPoint[] {
    if (period === 'all') {
        return series;
    }

    if (period === 'custom' && customRange?.from && customRange?.to) {
        return series.filter(
            (point) =>
                point.date >= customRange.from && point.date <= customRange.to,
        );
    }

    const daysMap: Record<'7d' | '30d' | '90d' | '12m', number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '12m': 365,
    };

    const totalDays = daysMap[period as keyof typeof daysMap];

    return series.slice(-totalDays);
}

function reduceByStep(series: ChartPoint[], step: number): ChartPoint[] {
    return series.filter(
        (_, index) => index % step === 0 || index === series.length - 1,
    );
}

function groupByMonth(series: ChartPoint[]): ChartPoint[] {
    const grouped = new Map<string, { total: number; date: string }>();

    for (const point of series) {
        const monthKey = point.date.slice(0, 7);
        const current = grouped.get(monthKey);

        if (current) {
            grouped.set(monthKey, {
                total: current.total + point.value,
                date: current.date,
            });
        } else {
            grouped.set(monthKey, {
                total: point.value,
                date: point.date,
            });
        }
    }

    return [...grouped.entries()].map(([monthKey, data]) => ({
        date: `${monthKey}-01`,
        label: formatMonthLabel(monthKey),
        value: Math.round(data.total),
    }));
}

function sumSeries(series: ChartPoint[]): number {
    return series.reduce((total, point) => total + point.value, 0);
}

function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatLabel(date: Date): string {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');

    return `${day}/${month}`;
}

function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const monthLabels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    return `${monthLabels[Number(month) - 1]}/${year}`;
}

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    });
}
