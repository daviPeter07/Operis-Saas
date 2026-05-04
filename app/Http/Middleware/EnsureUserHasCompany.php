<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasCompany
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->current_company_id) {
            return response()->json([
                'message' => 'User has no selected company.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
