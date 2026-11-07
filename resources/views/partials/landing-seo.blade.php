@php
    $seo = config('landing.seo');
    $organization = config('landing.organization');
    $developer = config('landing.developer');
    $plan = config('landing.plan');

    $pageTitle = $seo['title'].' - '.config('app.name');
    // With a trailing slash: /operis (no slash) is redirected by Apache to /operis/.
    $canonicalUrl = url('/').'/';
    $imageUrl = asset($seo['image']);
    $logoUrl = asset('apple-touch-icon.png');

    $structuredData = [
        '@context' => 'https://schema.org',
        '@graph' => [
            [
                '@type' => 'Organization',
                '@id' => $organization['url'].'/#organization',
                'name' => $organization['name'],
                'url' => $organization['url'],
                'logo' => $logoUrl,
            ],
            [
                '@type' => 'Organization',
                '@id' => $developer['url'].'/#organization',
                'name' => $developer['name'],
                'url' => $developer['url'],
            ],
            [
                '@type' => 'WebSite',
                '@id' => $canonicalUrl.'#website',
                'name' => 'Operis',
                'alternateName' => 'Sistema de gestão DG Computer',
                'url' => $canonicalUrl,
                'inLanguage' => 'pt-BR',
                'publisher' => ['@id' => $organization['url'].'/#organization'],
            ],
            [
                '@type' => 'WebApplication',
                '@id' => $canonicalUrl.'#software',
                'name' => 'Operis',
                'alternateName' => 'Sistema de gestão DG Computer',
                'description' => $seo['description'],
                'url' => $canonicalUrl,
                'image' => $imageUrl,
                'applicationCategory' => 'BusinessApplication',
                'applicationSubCategory' => 'Sistema de gestão empresarial (ERP)',
                'operatingSystem' => 'Navegador web (computador e celular)',
                'inLanguage' => 'pt-BR',
                'keywords' => implode(', ', $seo['keywords']),
                'featureList' => [
                    'Vendas no PIX, dinheiro, cartão e crediário',
                    'Controle de estoque automático',
                    'Contas a pagar e a receber',
                    'Compras à vista ou no boleto, com os vencimentos em contas a pagar',
                    'Cupom para impressora térmica e fatura em PDF',
                    'Relatórios de vendas, estoque e inadimplência',
                    'Produtos e serviços na mesma venda',
                ],
                'offers' => [
                    '@type' => 'Offer',
                    'name' => $plan['name'],
                    'price' => $plan['price'],
                    'priceCurrency' => $plan['currency'],
                    'url' => $canonicalUrl.'#preco',
                    'availability' => 'https://schema.org/InStock',
                    'seller' => ['@id' => $organization['url'].'/#organization'],
                ],
                'provider' => ['@id' => $organization['url'].'/#organization'],
                'creator' => ['@id' => $developer['url'].'/#organization'],
            ],
            [
                '@type' => 'FAQPage',
                '@id' => $canonicalUrl.'#duvidas',
                'mainEntity' => array_map(fn (array $item): array => [
                    '@type' => 'Question',
                    'name' => $item['question'],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']],
                ], config('landing.faq')),
            ],
        ],
    ];
@endphp
<meta name="description" content="{{ $seo['description'] }}">
<meta name="keywords" content="{{ implode(', ', $seo['keywords']) }}">
<meta name="author" content="{{ $organization['name'] }}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="{{ $seo['theme_color'] }}">
<link rel="canonical" href="{{ $canonicalUrl }}">
<link rel="sitemap" type="application/xml" href="{{ url('sitemap.xml') }}">

<meta property="og:type" content="website">
<meta property="og:locale" content="{{ $seo['locale'] }}">
<meta property="og:site_name" content="Operis por {{ $organization['name'] }}">
<meta property="og:title" content="{{ $pageTitle }}">
<meta property="og:description" content="{{ $seo['description'] }}">
<meta property="og:url" content="{{ $canonicalUrl }}">
<meta property="og:image" content="{{ $imageUrl }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{{ $seo['image_alt'] }}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $pageTitle }}">
<meta name="twitter:description" content="{{ $seo['description'] }}">
<meta name="twitter:image" content="{{ $imageUrl }}">
<meta name="twitter:image:alt" content="{{ $seo['image_alt'] }}">

<script type="application/ld+json">{!! json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
