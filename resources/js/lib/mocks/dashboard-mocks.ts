export type Period = '7d' | '30d' | '90d' | '12m';

export interface Metric {
    id: string;
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: string;
}

export interface Activity {
    id: string;
    type: 'sale' | 'purchase' | 'client' | 'product';
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
        id: 'revenue',
        label: 'Receita',
        value: 'R$ 45.2K',
        change: 12.5,
        trend: 'up',
        icon: 'TrendingUp',
    },
    {
        id: 'clients',
        label: 'Clientes',
        value: '128',
        change: 8.2,
        trend: 'up',
        icon: 'Users',
    },
    {
        id: 'orders',
        label: 'Pedidos',
        value: '89',
        change: -3.1,
        trend: 'down',
        icon: 'ShoppingCart',
    },
    {
        id: 'products',
        label: 'Produtos',
        value: '456',
        change: 5.7,
        trend: 'up',
        icon: 'Package',
    },
];

export const recentActivity: Activity[] = [
    {
        id: '1',
        type: 'sale',
        description: 'Venda para Maria Silva',
        amount: 'R$ 2.450,00',
        time: 'há 5 min',
    },
    {
        id: '2',
        type: 'client',
        description: 'Novo cliente cadastrado',
        amount: undefined,
        time: 'há 23 min',
    },
    {
        id: '3',
        type: 'purchase',
        description: 'Compra de Fornecedor ABC',
        amount: 'R$ 1.200,00',
        time: 'há 1h',
    },
    {
        id: '4',
        type: 'product',
        description: 'Produto atualizado',
        amount: undefined,
        time: 'há 2h',
    },
    {
        id: '5',
        type: 'sale',
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
