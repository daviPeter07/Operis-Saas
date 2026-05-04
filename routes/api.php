<?php

use App\Http\Controllers\Api\Auth\AuthenticatedUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')
    ->middleware('auth:sanctum')
    ->group(function (): void {
        Route::get('me', AuthenticatedUserController::class)->name('api.auth.me');
    });

Route::middleware([
    'auth:sanctum',
    'company.current',
    'company.user',
    'company.member',
    'company.verified',
])->group(function (): void {
    Route::get('context/ping', static fn () => response()->json(['ok' => true]))->name('api.context.ping');
});
