export type Period = '7d' | '30d' | '90d' | '12m';

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

export interface ChartData {
    label: string;
    value: number;
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

export const revenueChartData: ChartData[] = [
    { label: 'Jan', value: 28000 },
    { label: 'Fev', value: 32000 },
    { label: 'Mar', value: 35000 },
    { label: 'Abr', value: 31000 },
    { label: 'Mai', value: 40000 },
    { label: 'Jun', value: 45200 },
];

export const salesChartData: ChartData[] = [
    { label: 'Jan', value: 45 },
    { label: 'Fev', value: 52 },
    { label: 'Mar', value: 61 },
    { label: 'Abr', value: 48 },
    { label: 'Mai', value: 72 },
    { label: 'Jun', value: 89 },
];
