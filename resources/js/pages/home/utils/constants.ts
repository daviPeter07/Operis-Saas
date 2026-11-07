import {
    Award,
    BarChart3,
    Boxes,
    CalendarClock,
    ChartNoAxesCombined,
    CreditCard,
    DollarSign,
    LayoutGrid,
    Package,
    Printer,
    Receipt,
    Settings,
    ShoppingCart,
    Tags,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Wallet,
    Warehouse,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { withAppBasePath } from '@/constants/workspace';
import { login, register } from '@/routes';
import type {
    ComparisonRow,
    DemoActivity,
    DemoMetric,
    LegalDocument,
    PainPoint,
    StartStep,
    LandingUpdateType,
    PricingPlan,
} from './types';

const homeUrl = withAppBasePath('/');

export const landingLinks = {
    home: homeUrl,
    login: withAppBasePath(login().url),
    register: withAppBasePath(register().url),
    terms: withAppBasePath('/termos-de-uso'),
    privacy: withAppBasePath('/politica-de-privacidade'),
    syncforge: 'https://syncforge-business.vercel.app',
} as const;

// Full URLs, so the header and footer also work on the legal pages.
export const landingNavigation = [
    { label: 'Por que o Operis', href: `${homeUrl}#problemas` },
    { label: 'Demonstração', href: `${homeUrl}#demonstracao` },
    { label: 'Preço', href: `${homeUrl}#preco` },
    { label: 'Dúvidas', href: `${homeUrl}#duvidas` },
] as const;

/** Who sells the Operis (Termos, Privacidade and the footer). */
export const seller = {
    name: 'DG Computer',
    document: '34.501.706/0001-59',
    city: 'Manaus/AM',
    email: 'info@dgcomputer.com.br',
} as const;

export const CONTACT_WHATSAPP_MESSAGE =
    'Olá, tudo bem? Vim pelo site de vocês e queria conhecer o Operis. Como faço para ter acesso?';

/** WhatsApp that receives the plan requests (country + area code + number). */
export const SALES_WHATSAPP_NUMBER = '559299865111';

/**
 * Monthly plan price in reais. While it is null the card shows "Valor em breve";
 * set the number here (e.g. 39) to publish it.
 */
export const MONTHLY_PLAN_PRICE: number | null = 50;

export const pricingPlans: PricingPlan[] = [
    {
        id: 'plano-mensal',
        label: 'Mensal',
        name: 'Plano mensal',
        description: 'Para começar sem compromisso e pagar mês a mês.',
        price: MONTHLY_PLAN_PRICE,
        period: 'mês',
    },
    {
        id: 'plano-anual',
        label: 'Anual',
        name: 'Plano anual',
        description: 'Um pagamento por ano, com o preço promocional.',
        price: 300,
        originalPrice: 500,
        period: 'ano',
        badge: 'Promocional',
    },
];

export const promotionalPlan = {
    benefits: [
        'Vendas no PIX, dinheiro, cartão e crediário, com ou sem entrada',
        'Produtos e serviços na mesma venda, com o lucro de cada um',
        'Compras à vista ou no boleto, com os vencimentos em contas a pagar',
        'Estoque atualizado sozinho a cada venda, compra ou cancelamento',
        'Contas a pagar e a receber com baixa parcial, em lote e aviso de atraso',
        'Relatórios de vendas, estoque, inadimplência e maiores compradores',
        'Cupom na impressora térmica e comprovante em PDF para o cliente',
        'Tabelas exportadas para Excel e PDF quando você quiser',
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
        title: 'Venda do jeito que o cliente paga',
        description:
            'PIX, dinheiro, cartão ou crediário com ou sem entrada. As parcelas vão sozinhas para contas a receber.',
    },
    {
        icon: Boxes,
        title: 'Estoque que se atualiza sozinho',
        description:
            'Vendeu, comprou ou cancelou? O estoque muda na hora e cada movimento fica no histórico do produto.',
    },
    {
        icon: Printer,
        title: 'Cupom na hora',
        description:
            'Na impressora térmica do caixa ou em PDF, pronto para mandar no WhatsApp do cliente.',
    },
    {
        icon: Wrench,
        title: 'Produto e serviço na mesma venda',
        description:
            'Formatou o notebook e vendeu o SSD? Vai tudo no mesmo cupom, com o lucro de cada item.',
    },
];

export const painPoints: PainPoint[] = [
    {
        icon: Wallet,
        title: 'Parcela atrasada que ninguém percebe',
        pain: 'Quando as parcelas são controladas à mão, o atraso só aparece quando alguém lembra de conferir.',
        solution:
            'O Operis gera as parcelas com vencimento e lista as que estão atrasadas.',
    },
    {
        icon: Boxes,
        title: 'Estoque que não confere com a prateleira',
        pain: 'Basta uma venda sem registro para o número ficar errado.',
        solution:
            'Cada venda, compra e cancelamento atualiza o estoque na hora, e o painel avisa os produtos sem estoque.',
    },
    {
        icon: CalendarClock,
        title: 'Boleto de fornecedor pago com atraso',
        pain: 'Os vencimentos ficam espalhados entre notas, e-mails e papéis.',
        solution:
            'Os boletos da compra entram em contas a pagar com a data de cada um, e os atrasados viram alerta no painel.',
    },
    {
        icon: ChartNoAxesCombined,
        title: 'Lucro do mês só no fechamento',
        pain: 'Para saber se o mês foi bom, é preciso juntar vendas e custos de vários lugares.',
        solution:
            'Vendas, lucro e o que falta receber ficam no painel, comparados com o período anterior.',
    },
];

export const comparisonRows: ComparisonRow[] = [
    {
        question: 'Quem está com parcela atrasada?',
        before: 'Conferir anotação por anotação',
        operis: 'No filtro de contas vencidas',
    },
    {
        question: 'Quanto tenho de cada produto?',
        before: 'Contar na prateleira',
        operis: 'No estoque, atualizado a cada venda e compra',
    },
    {
        question: 'Quanto lucrei no mês?',
        before: 'Somar vendas e custos no fim do mês',
        operis: 'No painel, comparado com o período anterior',
    },
    {
        question: 'Quando vence o boleto do fornecedor?',
        before: 'Procurar o boleto',
        operis: 'Em contas a pagar, com alerta de atraso',
    },
    {
        question: 'Como mando o comprovante ao cliente?',
        before: 'Escrever o recibo à mão',
        operis: 'Cupom na impressora térmica ou PDF para enviar pelo WhatsApp',
    },
    {
        question: 'Consigo acompanhar de onde estiver?',
        before: 'Só com os papéis na mão',
        operis: 'Sim, pelo celular',
    },
];

export const startSteps: StartStep[] = [
    {
        title: 'Fale com a gente',
        description:
            'Chame no WhatsApp, conte como você trabalha hoje e escolha o plano.',
    },
    {
        title: 'Receba o seu acesso',
        description:
            'Liberamos a sua conta, e você entra pelo navegador do computador ou do celular.',
    },
    {
        title: 'Comece a vender',
        description:
            'Cadastre os produtos e os clientes e registre a primeira venda.',
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

const sellerIdentification = `${seller.name}, inscrita no CNPJ ${seller.document}, com sede em ${seller.city}`;

export const LEGAL_UPDATED_AT = '2026-11-06';

export const termsDocument: LegalDocument = {
    title: 'Termos de Uso',
    description:
        'As regras para usar o Operis: planos, pagamento, cancelamento e o que cabe a cada parte.',
    sections: [
        {
            title: 'Sobre estes termos',
            paragraphs: [
                'Estes Termos de Uso valem para quem cria uma conta e usa o Operis, o sistema de gestão online de vendas, estoque e financeiro. Ao criar a sua conta, você declara que leu e concorda com eles e com a Política de Privacidade.',
            ],
        },
        {
            title: 'Quem presta o serviço',
            paragraphs: [
                `O Operis é oferecido pela ${sellerIdentification}, que é quem vende o plano e atende você. O sistema foi desenvolvido e é mantido pela SyncForge, em nome da ${seller.name}.`,
            ],
        },
        {
            title: 'O que é o Operis',
            paragraphs: [
                'O Operis é um sistema acessado pelo navegador, no computador ou no celular, para registrar vendas, compras, estoque, clientes, fornecedores, serviços e contas a pagar e a receber.',
                'O sistema recebe melhorias com frequência, e funções podem mudar para ficar melhores. O que aparece como "em breve" só faz parte do serviço depois de lançado.',
                'O Operis não emite nota fiscal nem substitui o seu contador. As obrigações fiscais da sua empresa continuam sendo suas.',
            ],
        },
        {
            title: 'Sua conta',
            items: [
                'Os dados informados no cadastro precisam ser verdadeiros e ficar atualizados.',
                'A senha é pessoal. Você responde pelo que for feito com a sua conta, então não a compartilhe.',
                'Se perceber um acesso que não foi seu, avise a gente na hora.',
            ],
        },
        {
            title: 'Planos e pagamento',
            items: [
                'O Operis tem plano mensal e plano anual, com os mesmos recursos. Os valores são os da página de preço no momento da contratação.',
                'Preços promocionais valem pelo período informado na oferta.',
                'Um reajuste de preço é avisado com pelo menos 30 dias de antecedência e só vale a partir da próxima renovação.',
                'Se o pagamento não for feito, o acesso pode ser suspenso até a regularização.',
            ],
        },
        {
            title: 'Cancelamento',
            items: [
                'Plano mensal: você cancela quando quiser, sem multa e sem fidelidade. O acesso continua até o fim do mês já pago, e não há cobrança no mês seguinte.',
                'Plano anual: o valor é pago de uma vez e não há devolução proporcional em caso de cancelamento. O acesso continua até o fim do período contratado.',
                `Para cancelar, fale com a gente pelo WhatsApp ou pelo e-mail ${seller.email}.`,
            ],
        },
        {
            title: 'Os seus dados',
            paragraphs: [
                'Os cadastros, as vendas e as contas que você registra são da sua empresa. Você pode exportar as tabelas para Excel ou PDF a qualquer momento.',
                'Depois do cancelamento, os dados da sua empresa são apagados, como explicado na Política de Privacidade. Exporte o que quiser guardar antes de cancelar.',
                'Você é responsável pelos dados dos seus clientes e fornecedores que cadastra no sistema e por ter autorização ou motivo legal para usá-los.',
            ],
        },
        {
            title: 'O que não é permitido',
            items: [
                'Usar o Operis para qualquer atividade ilegal.',
                'Tentar acessar dados de outras empresas, burlar a segurança ou sobrecarregar o sistema de propósito.',
                'Revender ou repassar o acesso a terceiros sem autorização.',
            ],
            note: 'Nesses casos, a conta pode ser suspensa ou encerrada.',
        },
        {
            title: 'Disponibilidade e suporte',
            paragraphs: [
                'Trabalhamos para manter o Operis no ar o tempo todo, mas podem acontecer manutenções e falhas de internet ou de servidor fora do nosso controle. Quando possível, manutenções programadas são feitas fora do horário comercial.',
                `O suporte é feito pelo WhatsApp e pelo e-mail ${seller.email}.`,
            ],
        },
        {
            title: 'Responsabilidades',
            paragraphs: [
                'O Operis é uma ferramenta de gestão: as decisões tomadas com base nas informações do sistema, como preços, cobranças e compras, são da sua empresa. Confira os dados importantes antes de agir.',
                'Não respondemos por prejuízos causados por informações cadastradas de forma errada, pelo uso indevido da conta ou por falhas de serviços de terceiros, como internet e impressoras. Nada nestes termos limita os direitos garantidos por lei a quem é consumidor.',
            ],
        },
        {
            title: 'Propriedade do sistema',
            paragraphs: [
                'O plano dá o direito de usar o Operis enquanto estiver ativo. O sistema, a marca, as telas e o código continuam pertencendo aos seus donos e não podem ser copiados.',
            ],
        },
        {
            title: 'Mudanças nestes termos',
            paragraphs: [
                'Estes termos podem ser atualizados. Mudanças importantes são avisadas pelo sistema ou por e-mail antes de valer, e a data no topo desta página mostra a última versão.',
            ],
        },
        {
            title: 'Lei e foro',
            paragraphs: [
                'Estes termos seguem a lei brasileira. Fica eleito o foro da comarca de Manaus/AM para resolver qualquer questão, ressalvado o direito do consumidor de usar o foro do seu domicílio.',
            ],
        },
    ],
};

export const privacyDocument: LegalDocument = {
    title: 'Política de Privacidade',
    description:
        'Quais dados o Operis guarda, para que servem, com quem são compartilhados e como você controla tudo isso.',
    sections: [
        {
            title: 'Quem cuida dos seus dados',
            paragraphs: [
                `O Operis é oferecido pela ${sellerIdentification}. O sistema é desenvolvido e mantido pela SyncForge, que trata os dados em nome da ${seller.name} e só para fazer o Operis funcionar.`,
                'Esta política segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).',
            ],
        },
        {
            title: 'Que dados guardamos',
            items: [
                'Da sua conta: nome, e-mail e senha. A senha é guardada criptografada, e ninguém consegue lê-la.',
                'Da sua empresa: nome, CNPJ ou CPF, endereço, telefone e e-mail.',
                'O que você registra no sistema: clientes, fornecedores, produtos, serviços, vendas, compras e contas a pagar e a receber.',
                'Dados de acesso: endereço IP, data e hora dos acessos e os cookies necessários para manter você conectado.',
            ],
        },
        {
            title: 'Para que usamos',
            items: [
                'Para o Operis funcionar: guardar e mostrar as suas vendas, o seu estoque e as suas contas.',
                'Para manter a sua conta segura e identificar acessos indevidos.',
                'Para falar com você sobre a conta, o plano, o pagamento e o suporte.',
                'Para cumprir obrigações legais.',
            ],
            note: 'Não vendemos os seus dados e não os usamos para propaganda.',
        },
        {
            title: 'Os dados dos seus clientes',
            paragraphs: [
                'Quando você cadastra clientes e fornecedores, a sua empresa decide quais dados guardar e para quê; nós só armazenamos e processamos esses dados para o sistema funcionar. Pela LGPD, a sua empresa é a controladora desses dados e nós somos operadores.',
                'Cabe à sua empresa ter autorização ou motivo legal para guardar esses dados e atender os pedidos dos seus clientes sobre eles.',
            ],
        },
        {
            title: 'Com quem compartilhamos',
            items: [
                'SyncForge, que desenvolve e mantém o sistema.',
                'A empresa de hospedagem onde ficam os servidores do Operis.',
                'Autoridades públicas, quando a lei ou uma ordem judicial exigir.',
            ],
            note: 'Ninguém mais tem acesso aos seus dados, e cada empresa só vê as próprias informações.',
        },
        {
            title: 'Cookies',
            paragraphs: [
                'O Operis usa apenas cookies essenciais: o que mantém você conectado e o que protege os formulários contra fraudes. Não usamos cookies de propaganda nem de rastreamento.',
            ],
        },
        {
            title: 'Segurança',
            paragraphs: [
                'O acesso é feito por conexão segura (HTTPS), as senhas são criptografadas, os dados de cada empresa ficam separados e só pessoas autorizadas mexem nos servidores. Nenhum sistema é 100% invulnerável, mas, se acontecer um incidente que afete você, avisaremos.',
            ],
        },
        {
            title: 'Por quanto tempo guardamos',
            paragraphs: [
                'Os dados ficam guardados enquanto a sua conta estiver ativa.',
                'Quando o plano é cancelado, os dados da sua empresa são apagados em até 30 dias. Antes de cancelar, você pode exportar as suas tabelas para Excel ou PDF. Só guardamos depois disso o que a lei obrigar, como os registros de cobrança do próprio plano.',
            ],
        },
        {
            title: 'Os seus direitos',
            paragraphs: ['Pela LGPD, você pode pedir a qualquer momento:'],
            items: [
                'Confirmação de que tratamos os seus dados e acesso a eles.',
                'Correção de dados incompletos ou errados.',
                'Uma cópia dos seus dados (portabilidade).',
                'A exclusão dos seus dados, respeitado o que a lei obriga a guardar.',
                'Informação sobre com quem os seus dados são compartilhados.',
            ],
        },
        {
            title: 'Contato',
            paragraphs: [
                `Para qualquer pedido ou dúvida sobre os seus dados, escreva para ${seller.email}. Respondemos o mais rápido possível, dentro do prazo da lei.`,
            ],
        },
        {
            title: 'Mudanças nesta política',
            paragraphs: [
                'Esta política pode ser atualizada. A data no topo desta página mostra a última versão, e mudanças importantes são avisadas antes de valer.',
            ],
        },
    ],
};
