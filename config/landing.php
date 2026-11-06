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
            'date' => '2026-11-06',
            'type' => 'novidade',
            'title' => 'Histórico da compra e contas ligadas',
            'description' => 'Veja nos detalhes da compra cada boleto pago, edição e cancelamento, abra a venda ou a compra direto pela conta e filtre o período pelo mês anterior.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Contas a receber e a pagar com filtros e detalhes',
            'description' => 'Filtre as contas por cliente, fornecedor, descrição, origem e status, abra os detalhes de cada uma e dê baixa em várias de uma vez pela barra de seleção.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Crediário sem entrada',
            'description' => 'A entrada do crediário agora é opcional: sem ela, o valor total da venda é dividido nas parcelas.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'novidade',
            'title' => 'Comprovante em PDF no tamanho do cupom',
            'description' => 'Salve o comprovante da venda em PDF de 80 mm, igual ao cupom da impressora térmica, para enviar ao cliente, e marque no cadastro da compra quais boletos já foram pagos.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Compras em etapas e boletos mais claros',
            'description' => 'Registre a compra em 4 passos, cadastre o fornecedor pela busca e veja, antes de salvar, quantos boletos serão gerados com a data e o valor de cada um.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'correcao',
            'title' => 'Observações e pagamentos das compras preservados',
            'description' => 'As observações da compra agora ficam salvas, e editar uma compra não desfaz mais os boletos que já foram pagos.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Comprovante da venda em PDF mais completo',
            'description' => 'O PDF do comprovante mostra se a venda está paga ou pendente, o desconto, quanto já foi pago e, no crediário, cada parcela com o vencimento.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Cadastro de venda em etapas',
            'description' => 'Registre a venda em 4 passos (produtos, cliente e carrinho, pagamento e resumo), com a confirmação na tela de cada produto adicionado e o total do carrinho sempre à vista.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'correcao',
            'title' => 'Desconto e crediário corretos nas vendas',
            'description' => 'O desconto aplicado no caixa agora é salvo na venda e entra no total, nas parcelas e na entrada do crediário, e cancelar uma venda devolve o estoque e cancela as parcelas em aberto.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Vendas com filtros por coluna e página de detalhes',
            'description' => 'Filtre as vendas por cliente, produto, categoria, marca, status e forma de pagamento, e veja cada venda numa página própria com itens, parcelas e o histórico de tudo o que aconteceu com ela.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'melhoria',
            'title' => 'Clientes, fornecedores, categorias e marcas com filtros por coluna',
            'description' => 'Filtre e ordene essas listas direto em cada coluna, veja os detalhes de clientes e fornecedores numa página própria e abra os produtos de uma categoria ou marca com um clique.',
        ],
        [
            'date' => '2026-11-06',
            'type' => 'correcao',
            'title' => 'Tipo do cliente e crédito disponível corretos',
            'description' => 'O tipo de pessoa (física ou jurídica) escolhido no cadastro do cliente agora é salvo, e o crédito disponível do crediário considera todas as contas em aberto.',
        ],
        [
            'date' => '2026-11-05',
            'type' => 'melhoria',
            'title' => 'Estoque com filtros por coluna e página do produto',
            'description' => 'Filtre e ordene o estoque direto em cada coluna e veja todos os dados de um produto, com lucro e margem, na página dele.',
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
