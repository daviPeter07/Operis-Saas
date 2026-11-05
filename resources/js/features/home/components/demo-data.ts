import {
    Award,
    BarChart3,
    CreditCard,
    DollarSign,
    LayoutGrid,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Tags,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Sample data for the demo screens. Labels, icons and colors mirror the real Operis overview. */
export const demoCompanyName = 'Sua Empresa';

export const demoNavigation: { label: string; icon: LucideIcon }[] = [
    { label: 'Visão Geral', icon: LayoutGrid },
    { label: 'Estoque', icon: Warehouse },
    { label: 'Vendas', icon: TrendingUp },
    { label: 'Compras', icon: ShoppingCart },
    { label: 'Clientes', icon: Users },
    { label: 'Fornecedores', icon: Truck },
    { label: 'Marcas', icon: Award },
    { label: 'Categorias', icon: Tags },
    { label: 'Contas a Receber', icon: CreditCard },
    { label: 'Contas a Pagar', icon: Receipt },
    { label: 'Equipe', icon: UsersRound },
    { label: 'Relatórios', icon: BarChart3 },
    { label: 'Configurações', icon: Settings },
];

export type DemoMetric = {
    label: string;
    value: string;
    icon: LucideIcon;
    iconClassName: string;
};

export const demoMetrics: DemoMetric[] = [
    {
        label: 'Vendas',
        value: 'R$ 48.920,40',
        icon: ShoppingCart,
        iconClassName: 'text-orange-500 bg-orange-500/12 ring-orange-500/20',
    },
    {
        label: 'Lucro',
        value: 'R$ 14.676,12',
        icon: TrendingUp,
        iconClassName: 'text-green-600 bg-green-600/12 ring-green-600/20',
    },
    {
        label: 'Contas a Receber',
        value: 'R$ 9.870,00',
        icon: Receipt,
        iconClassName: 'text-blue-500 bg-blue-500/12 ring-blue-500/20',
    },
    {
        label: 'Contas a Pagar',
        value: 'R$ 6.215,30',
        icon: CreditCard,
        iconClassName: 'text-red-600 bg-red-600/12 ring-red-600/20',
    },
];

/** Daily totals of the period, in thousands of reais. */
export const demoSalesSeries = [
    1.2, 2.4, 1.8, 3.1, 2.2, 1.4, 2.8, 3.6, 2.5, 2.9, 3.9, 4.4, 3.7, 4.6,
];
export const demoProfitSeries = [
    0.4, 0.8, 0.5, 1, 0.7, 0.4, 0.9, 1.1, 0.8, 0.9, 1.2, 1.4, 1.1, 1.5,
];

export type DemoActivity = {
    description: string;
    responsible: string;
    amount?: string;
    time: string;
    icon: LucideIcon;
    iconClassName: string;
};

export const demoActivities: DemoActivity[] = [
    {
        description: 'Venda para Ana Paula Souza',
        responsible: 'Caixa 1',
        amount: 'R$ 819,70',
        time: 'há 5 min',
        icon: DollarSign,
        iconClassName: 'text-green-600 bg-green-600/10',
    },
    {
        description: 'Compra de Distribuidora Norte',
        responsible: 'Financeiro',
        amount: 'R$ 3.480,00',
        time: 'há 32 min',
        icon: ShoppingCart,
        iconClassName: 'text-orange-600 bg-orange-600/10',
    },
    {
        description: 'Novo cliente: Carlos Henrique',
        responsible: 'Caixa 2',
        time: 'há 1 h',
        icon: Users,
        iconClassName: 'text-blue-600 bg-blue-600/10',
    },
    {
        description: 'Produto cadastrado: SSD NVMe 1TB',
        responsible: 'Estoque',
        time: 'há 2 h',
        icon: Package,
        iconClassName: 'text-purple-600 bg-purple-600/10',
    },
    {
        description: 'Venda para Juliana Martins',
        responsible: 'Caixa 1',
        amount: 'R$ 189,90',
        time: 'há 3 h',
        icon: DollarSign,
        iconClassName: 'text-green-600 bg-green-600/10',
    },
];
