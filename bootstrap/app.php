<?php

use App\Http\Middleware\BypassAuth;
use App\Http\Middleware\EnsureCompanyIsVerified;
use App\Http\Middleware\EnsureCurrentCompanyMember;
use App\Http\Middleware\EnsureUserHasCompany;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetCurrentCompany;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

$apiPrefix = require __DIR__.'/../config/api.php';

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: trim((string) ($apiPrefix['base_path'] ?? 'operis/api'), '/'),
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->web(append: [
            BypassAuth::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'company.user' => EnsureUserHasCompany::class,
            'company.verified' => EnsureCompanyIsVerified::class,
            'company.current' => SetCurrentCompany::class,
            'company.member' => EnsureCurrentCompanyMember::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
