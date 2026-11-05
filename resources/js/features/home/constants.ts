import { withAppBasePath } from '@/constants/workspace';
import { login, register } from '@/routes';

export const landingLinks = {
    login: withAppBasePath(login().url),
    register: withAppBasePath(register().url),
    syncforge: 'https://syncforge-business.vercel.app',
} as const;

export const landingNavigation = [
    { label: 'Demonstração', href: '#demonstracao' },
    { label: 'Atualizações', href: '#atualizacoes' },
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

/** FAQ entries come from config/landing.php so the page and its structured data match. */
export type FrequentlyAskedQuestion = {
    question: string;
    answer: string;
};

/** "Últimas atualizações" entries come from config/landing.php (3 most recent). */
export type LandingUpdateType = 'novidade' | 'melhoria' | 'correcao';

export type LandingUpdate = {
    date: string;
    type: LandingUpdateType;
    title: string;
    description: string;
};

export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}
