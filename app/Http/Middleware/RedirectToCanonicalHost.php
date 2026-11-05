<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sends visitors of the bare domain (dgcomputer.com.br) to the canonical
 * "www." host taken from APP_URL. Assets are served from ASSET_URL on the
 * www host, so the bare domain would otherwise load a blank page (CORS).
 */
class RedirectToCanonicalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $canonicalHost = parse_url((string) config('app.url'), PHP_URL_HOST);

        if (! is_string($canonicalHost) || $canonicalHost !== 'www.'.$request->getHost()) {
            return $next($request);
        }

        $scheme = parse_url((string) config('app.url'), PHP_URL_SCHEME) ?: $request->getScheme();
        $target = $scheme.'://'.$canonicalHost.$request->getRequestUri();

        // 308 keeps the method and body of non-GET requests (e.g. a login POST).
        $status = $request->isMethod('GET') || $request->isMethod('HEAD') ? 301 : 308;

        return redirect()->away($target, $status);
    }
}
