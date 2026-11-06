<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page renders SEO, Open Graph and DG Computer metadata on the server', function () {
    $response = $this->get(route('home'))->assertOk();

    $html = $response->getContent();

    expect($html)
        ->toContain('<title>'.config('landing.seo.title').' - '.config('app.name').'</title>')
        ->toContain('<meta name="description" content="'.e(config('landing.seo.description')).'">')
        ->toContain('<meta name="keywords" content="DG Computer, sistema DG Computer')
        ->toContain('<meta name="robots" content="index, follow')
        ->toContain('<link rel="canonical" href="'.url('/').'/">')
        ->toContain('<meta property="og:image" content="'.asset('og-image.png').'">')
        ->toContain('<meta name="twitter:card" content="summary_large_image">')
        ->toContain('href="'.asset('favicon.svg').'"');
});

test('landing page structured data describes Operis, DG Computer and the visible FAQ', function () {
    $html = $this->get(route('home'))->assertOk()->getContent();

    preg_match('#<script type="application/ld\+json">(.+?)</script>#s', $html, $matches);
    $graph = collect(json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR)['@graph']);

    $software = $graph->firstWhere('@type', 'WebApplication');
    $faqPage = $graph->firstWhere('@type', 'FAQPage');

    expect($graph->pluck('name'))->toContain('DG Computer', 'SyncForge')
        ->and($software['offers']['price'])->toBe(300)
        ->and($software['offers']['priceCurrency'])->toBe('BRL')
        ->and($faqPage['mainEntity'])->toHaveCount(count(config('landing.faq')))
        ->and($faqPage['mainEntity'][0]['name'])->toBe(config('landing.faq')[0]['question']);
});

test('landing page receives the same FAQ used in the structured data', function () {
    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->where('seoTitle', config('landing.seo.title'))
            ->has('faq', count(config('landing.faq'))));
});

test('sitemap lists the public pages with absolute urls', function () {
    $response = $this->get(route('sitemap'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $locations = [];

    foreach (simplexml_load_string($response->getContent())->url as $entry) {
        $locations[] = (string) $entry->loc;
    }

    expect($locations)->toBe([url('/').'/', url('/register'), url('/login')]);
});

test('dashboard pages are kept out of search results', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
});
