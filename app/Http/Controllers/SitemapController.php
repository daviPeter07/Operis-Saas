<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Public pages listed for search engines. The dashboard is private and stays out.
     *
     * @var list<array{path: string, changefreq: string, priority: string}>
     */
    private const PUBLIC_PAGES = [
        ['path' => '/', 'changefreq' => 'weekly', 'priority' => '1.0'],
        ['path' => '/register', 'changefreq' => 'monthly', 'priority' => '0.6'],
        ['path' => '/login', 'changefreq' => 'monthly', 'priority' => '0.4'],
        ['path' => '/termos-de-uso', 'changefreq' => 'yearly', 'priority' => '0.2'],
        ['path' => '/politica-de-privacidade', 'changefreq' => 'yearly', 'priority' => '0.2'],
    ];

    /**
     * Render the XML sitemap with absolute URLs under the app's base path (e.g. /operis).
     * The home page keeps its trailing slash, since /operis (no slash) is redirected to /operis/.
     */
    public function __invoke(): Response
    {
        $lastModified = now(config('app.business_timezone'))->toDateString();

        $entries = collect(self::PUBLIC_PAGES)
            ->map(fn (array $page): string => sprintf(
                "  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>%s</changefreq>\n    <priority>%s</priority>\n  </url>",
                e($page['path'] === '/' ? url('/').'/' : url($page['path'])),
                $lastModified,
                $page['changefreq'],
                $page['priority'],
            ))
            ->implode("\n");

        $xml = <<<XML
            <?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            {$entries}
            </urlset>
            XML;

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
