<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class BypassAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('logout') || $request->routeIs('logout')) {
            return $next($request);
        }

        if (
            $request->is('login') ||
            $request->routeIs('login')
        ) {
            return $next($request);
        }

        if (
            $request->is('register') ||
            $request->routeIs('register')
        ) {
            return $next($request);
        }

        // Only enable bypass auto-login when explicitly allowed via
        // the BYPASS_AUTH env var. This avoids silently re-authenticating
        // users in local/dev environments unless the developer opts-in.
        if (filter_var(env('BYPASS_AUTH', false), FILTER_VALIDATE_BOOLEAN) === false) {
            return $next($request);
        }

        if (Auth::check()) {
            return $next($request);
        }

        $user = User::first();

        if ($user) {
            Auth::login($user);
        }

        return $next($request);
    }
}
