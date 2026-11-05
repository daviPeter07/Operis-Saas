<?php

/*
|--------------------------------------------------------------------------
| Public landing page
|--------------------------------------------------------------------------
|
| SEO metadata and the FAQ shown on the landing page (/). The FAQ is sent to
| the page as an Inertia prop and also printed as FAQPage structured data, so
| both always say exactly the same thing.
|
*/

return [

    'seo' => [
        'title' => 'Sistema de gestão DG Computer: vendas, estoque e crediário',

        'description' => 'Operis, o sistema de gestão da DG Computer: controle vendas, estoque, crediário, contas a pagar e a receber e imprima o cupom térmico, no computador ou no celular.',

        'keywords' => [
            'DG Computer',
            'sistema DG Computer',
            'sistema de gestão DG Computer',
            'ERP DG Computer',
            'Operis DG Computer',
            'Operis',
            'sistema de gestão',
            'sistema de gestão empresarial',
            'software de gestão',
            'ERP para pequenas empresas',
            'ERP online',
            'sistema para loja',
            'sistema para loja de informática',
            'sistema para comércio',
            'sistema de vendas',
            'PDV online',
            'frente de caixa',
            'controle de estoque',
            'sistema de estoque',
            'crediário',
            'sistema de crediário',
            'controle de crediário',
            'venda parcelada',
            'contas a pagar',
            'contas a receber',
            'controle financeiro',
            'fluxo de caixa',
            'cupom térmico',
            'impressora térmica',
            'cadastro de clientes',
            'cadastro de fornecedores',
            'relatórios de vendas',
            'controle de inadimplência',
            'compras no boleto',
            'sistema online',
            'sistema na nuvem',
            'gestão comercial',
        ],

        'image' => 'og-image.png',
        'image_alt' => 'Operis, o sistema de gestão da DG Computer: vendas, estoque e crediário num sistema só.',
        'locale' => 'pt_BR',
        'theme_color' => '#2b2b2b',
    ],

    'organization' => [
        'name' => 'DG Computer',
        'url' => 'https://www.dgcomputer.com.br',
    ],

    'developer' => [
        'name' => 'SyncForge',
        'url' => 'https://syncforge-business.vercel.app',
    ],

    'plan' => [
        'name' => 'Plano anual',
        'price' => 300,
        'currency' => 'BRL',
    ],

    /*
    | "Últimas atualizações" section. The landing shows the 3 most recent
    | entries (sorted by date). Write for the customer, not in commit language.
    | type: novidade | melhoria | correcao
    |
    | @var list<array{date: string, type: string, title: string, description: string}>
    */
    'updates' => [
        [
            'date' => '2026-11-05',
            'type' => 'correcao',
            'title' => 'Acesso também sem o www',
            'description' => 'O Operis agora abre normalmente pelo endereço dgcomputer.com.br/operis, sem precisar digitar o www.',
        ],
        [
            'date' => '2026-07-01',
            'type' => 'melhoria',
            'title' => 'Valor original das contas sempre visível',
            'description' => 'Contas pagas em partes mostram o valor total original, quanto já foi pago e quanto ainda falta.',
        ],
        [
            'date' => '2026-06-03',
            'type' => 'melhoria',
            'title' => 'Escolha o período do painel',
            'description' => 'Veja os números da visão geral do mês atual, do próximo mês, de todo o período ou de datas que você definir.',
        ],
        [
            'date' => '2026-06-01',
            'type' => 'novidade',
            'title' => 'Cupom na impressora térmica',
            'description' => 'Imprima o cupom da venda direto na impressora térmica do caixa, em papel de 58 ou 80 mm.',
        ],
        [
            'date' => '2026-05-20',
            'type' => 'novidade',
            'title' => 'Compras no boleto parcelado',
            'description' => 'Ao lançar uma compra no boleto, as parcelas e os vencimentos vão sozinhos para contas a pagar.',
        ],
        [
            'date' => '2026-05-18',
            'type' => 'novidade',
            'title' => 'Relatórios com exportação',
            'description' => 'Relatórios de vendas, estoque e inadimplência, com exportação para Excel e PDF.',
        ],
    ],

    /*
    | @var list<array{question: string, answer: string}>
    */
    'faq' => [
        [
            'question' => 'Preciso instalar alguma coisa?',
            'answer' => 'Não. O Operis funciona no navegador, no computador ou no celular. Basta ter internet e entrar com seu e-mail e senha.',
        ],
        [
            'question' => 'O que está incluído nos R$ 300 por ano?',
            'answer' => 'Todos os módulos do sistema: vendas, compras, estoque, clientes, fornecedores, contas a pagar e a receber e relatórios. Não existe módulo cobrado à parte.',
        ],
        [
            'question' => 'Consigo imprimir o cupom da venda?',
            'answer' => 'Sim. Com uma impressora térmica ligada ao computador, o cupom sai direto pelo navegador Chrome ou Edge. A venda também pode ser baixada como fatura em PDF.',
        ],
        [
            'question' => 'Como funciona o crediário?',
            'answer' => 'Na venda, você informa a entrada, o número de parcelas e a data da primeira. O sistema gera as parcelas em contas a receber e mostra no relatório de inadimplência quem está com pagamento atrasado.',
        ],
        [
            'question' => 'Posso trazer os cadastros que já tenho?',
            'answer' => 'Sim. Clientes, fornecedores, produtos, marcas e categorias podem ser importados de uma planilha, sem digitar tudo de novo.',
        ],
        [
            'question' => 'Os dados da minha empresa ficam separados?',
            'answer' => 'Sim. Cada empresa tem seus próprios cadastros, vendas e financeiro, e só os usuários dela têm acesso a essas informações.',
        ],
    ],

];
