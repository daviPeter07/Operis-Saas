<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $company = $request->user()?->currentCompany;

        if (! $company?->verified_at) {
            return response()->json([
                'message' => 'Current company is not verified.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
