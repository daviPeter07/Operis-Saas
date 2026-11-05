import { withAppBasePath } from '@/constants/workspace';
import { login, register } from '@/routes';

export const landingLinks = {
    login: withAppBasePath(login().url),
    register: withAppBasePath(register().url),
    dgComputer: 'https://www.dgcomputer.com.br',
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

export const frequentlyAskedQuestions = [
    {
        question: 'Preciso instalar alguma coisa?',
        answer: 'Não. O Operis funciona no navegador, no computador ou no celular. Basta ter internet e entrar com seu e-mail e senha.',
    },
    {
        question: 'O que está incluído nos R$ 300 por ano?',
        answer: 'Todos os módulos do sistema: vendas, compras, estoque, clientes, fornecedores, contas a pagar e a receber e relatórios. Não existe módulo cobrado à parte.',
    },
    {
        question: 'Consigo imprimir o cupom da venda?',
        answer: 'Sim. Com uma impressora térmica ligada ao computador, o cupom sai direto pelo navegador Chrome ou Edge. A venda também pode ser baixada como fatura em PDF.',
    },
    {
        question: 'Como funciona o crediário?',
        answer: 'Na venda, você informa a entrada, o número de parcelas e a data da primeira. O sistema gera as parcelas em contas a receber e mostra no relatório de inadimplência quem está com pagamento atrasado.',
    },
    {
        question: 'Posso trazer os cadastros que já tenho?',
        answer: 'Sim. Clientes, fornecedores, produtos, marcas e categorias podem ser importados de uma planilha, sem digitar tudo de novo.',
    },
    {
        question: 'Os dados da minha empresa ficam separados?',
        answer: 'Sim. Cada empresa tem seus próprios cadastros, vendas e financeiro, e só os usuários dela têm acesso a essas informações.',
    },
] as const;

export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}
