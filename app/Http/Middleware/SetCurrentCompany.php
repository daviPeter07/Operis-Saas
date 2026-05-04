<?php

namespace App\Http\Middleware;

use App\Support\Company\CurrentCompanyResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentCompany
{
    public function __construct(private readonly CurrentCompanyResolver $currentCompanyResolver) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $request->attributes->set('current_company', $this->currentCompanyResolver->resolve($user));
        }

        return $next($request);
    }
}
