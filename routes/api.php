<?php

use App\Http\Controllers\Api\Auth\AuthenticatedUserController;
use App\Http\Controllers\Api\Onboarding\CompanyOnboardingController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationCodeController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationResendController;
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

Route::prefix('onboarding')
    ->middleware('auth:sanctum')
    ->group(function (): void {
        Route::post('company', [CompanyOnboardingController::class, 'store'])->name('api.onboarding.company.store');
        Route::post('verify-code', [CompanyVerificationCodeController::class, 'store'])->name('api.onboarding.verify-code.store');
        Route::post('resend-code', [CompanyVerificationResendController::class, 'store'])->name('api.onboarding.resend-code.store');
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
