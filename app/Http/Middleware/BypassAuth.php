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

        if ($request->is('login') || $request->routeIs('login')) {
            return $next($request);
        }

        if ($request->is('register') || $request->routeIs('register')) {
            return $next($request);
        }

        if (! app()->environment('local', 'development')) {
            return $next($request);
        }

        if (! config('app.debug')) {
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
