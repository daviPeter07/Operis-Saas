import {
    Award,
    BarChart3,
    CreditCard,
    LayoutGrid,
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

/** Sample data shown in the demo screens. It mirrors the real Operis menu. */
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

export const demoMetrics = [
    {
        label: 'Vendas no mês',
        value: 'R$ 48.920,40',
        detail: '+12% que outubro',
    },
    { label: 'Ticket médio', value: 'R$ 611,51', detail: '80 vendas' },
    { label: 'A receber', value: 'R$ 9.870,00', detail: '23 parcelas abertas' },
    { label: 'Estoque baixo', value: '7 produtos', detail: 'abaixo do mínimo' },
];

/** Daily sales of the current month, in thousands of reais. */
export const demoDailySales = [
    1.2, 2.4, 1.8, 3.1, 2.2, 0.9, 2.8, 3.6, 2.5, 1.9, 3.9, 4.4, 2.7, 3.2, 2.1,
    3.8, 4.1, 2.9, 3.4, 4.8,
];

export const demoRecentSales = [
    {
        customer: 'Ana Paula Souza',
        method: 'Crediário 3x',
        amount: 'R$ 819,70',
        status: 'Pendente',
    },
    {
        customer: 'Carlos Henrique',
        method: 'PIX',
        amount: 'R$ 1.249,00',
        status: 'Concluída',
    },
    {
        customer: 'Mercado Bom Preço',
        method: 'Cartão de crédito',
        amount: 'R$ 3.480,00',
        status: 'Concluída',
    },
    {
        customer: 'Juliana Martins',
        method: 'Dinheiro',
        amount: 'R$ 189,90',
        status: 'Concluída',
    },
    {
        customer: 'Roberto Lima',
        method: 'Crediário 5x',
        amount: 'R$ 2.150,00',
        status: 'Pendente',
    },
] as const;
