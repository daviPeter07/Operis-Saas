import {
    Award,
    BarChart3,
    Boxes,
    CreditCard,
    DollarSign,
    LayoutGrid,
    Package,
    Printer,
    Receipt,
    Settings,
    ShoppingCart,
    Smartphone,
    Tags,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Wallet,
    Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { withAppBasePath } from '@/constants/workspace';
import { login, register } from '@/routes';
import type { DemoActivity, DemoMetric, LandingUpdateType } from './types';

export const landingLinks = {
    login: withAppBasePath(login().url),
    register: withAppBasePath(register().url),
    syncforge: 'https://syncforge-business.vercel.app',
} as const;

export const landingNavigation = [
    { label: 'Demonstração', href: '#demonstracao' },
    { label: 'Preço', href: '#preco' },
    { label: 'Dúvidas', href: '#duvidas' },
] as const;

export const promotionalPlan = {
    yearlyPrice: 300,
    monthlyEquivalent: 25,
    benefits: [
        'Vendas no PIX, dinheiro, cartão e crediário com entrada e parcelas',
        'Compras com pagamento à vista ou boleto em 30, 60, 90 ou 120 dias',
        'Estoque atualizado sozinho a cada venda, compra ou cancelamento',
        'Contas a pagar e a receber com baixa parcial e estorno',
        'Relatórios de vendas, estoque, inadimplência e maiores compradores',
        'Cupom para impressora térmica e fatura da venda em PDF',
        'Importação de cadastros por planilha e exportação para Excel e PDF',
        'Acesso pelo computador e pelo celular, sem instalar nada',
    ],
} as const;

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

/** Screen sizes at which the mocks are drawn before being scaled into the frames. */
export const desktopScreenSize = {
    width: 1280,
    height: Math.round((1280 * 700) / 1200),
};

export const mobileScreenSize = {
    width: 390,
    height: Math.round((390 * 843.5) / 389.5),
};

export const highlights = [
    {
        icon: Wallet,
        title: 'Vendas e crediário',
        description:
            'PIX, dinheiro, cartão ou parcelado com entrada. As parcelas vão sozinhas para contas a receber.',
    },
    {
        icon: Boxes,
        title: 'Estoque sem planilha',
        description:
            'Cada venda, compra ou cancelamento atualiza o estoque e fica no histórico do produto.',
    },
    {
        icon: Printer,
        title: 'Cupom e fatura',
        description:
            'Imprima o cupom na impressora térmica do caixa ou envie a fatura em PDF para o cliente.',
    },
    {
        icon: Smartphone,
        title: 'No computador e no celular',
        description:
            'A mesma conta abre no navegador do caixa, do notebook ou do celular.',
    },
];

export const footerLinkClassName =
    'rounded-md text-sm text-neutral-600 outline-none hover:text-dg-ink focus-visible:ring-3 focus-visible:ring-dg-orange/60';

export const receiptItems = [
    { description: 'SSD NVMe 1TB', quantity: 1, price: 449.9 },
    { description: 'Memória DDR4 16GB', quantity: 1, price: 279.9 },
    { description: 'Mouse sem fio', quantity: 1, price: 89.9 },
];

export const downPayment = 99.7;

export const installments = [
    { number: 1, dueDate: '05/12/2026', amount: 240 },
    { number: 2, dueDate: '05/01/2027', amount: 240 },
    { number: 3, dueDate: '05/02/2027', amount: 240 },
];

export const saleTotal = receiptItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
);

/** Saw-tooth bottom edge of the paper, as torn from the printer. */
export const tornEdge = (() => {
    const teeth = 22;
    const points = ['0% 0%', '100% 0%', '100% calc(100% - 8px)'];

    for (let tooth = teeth; tooth >= 0; tooth--) {
        const x = (tooth / teeth) * 100;
        points.push(`${x}% ${tooth % 2 === 0 ? 'calc(100% - 8px)' : '100%'}`);
    }

    return `polygon(${points.join(', ')})`;
})();

export const printDuration = 2.4;

export const typeLabels: Record<LandingUpdateType, string> = {
    novidade: 'Novidade',
    melhoria: 'Melhoria',
    correcao: 'Correção',
};

export const typeClassNames: Record<LandingUpdateType, string> = {
    novidade: 'bg-dg-orange/15 text-[#9a5208]',
    melhoria: 'bg-blue-500/10 text-blue-700',
    correcao: 'bg-emerald-500/10 text-emerald-700',
};
