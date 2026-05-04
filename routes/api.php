<?php

use App\Http\Controllers\Api\Auth\AuthenticatedUserController;
use App\Http\Controllers\Api\Brands\BrandController;
use App\Http\Controllers\Api\Categories\CategoryController;
use App\Http\Controllers\Api\Customers\CustomerController;
use App\Http\Controllers\Api\Finance\AccountPayableController;
use App\Http\Controllers\Api\Finance\AccountPayablePaymentController;
use App\Http\Controllers\Api\Finance\AccountReceivableController;
use App\Http\Controllers\Api\Onboarding\CompanyOnboardingController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationCodeController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationResendController;
use App\Http\Controllers\Api\Products\ProductController;
use App\Http\Controllers\Api\Purchases\PurchaseCancelController;
use App\Http\Controllers\Api\Purchases\PurchaseController;
use App\Http\Controllers\Api\Sales\SaleCancelController;
use App\Http\Controllers\Api\Sales\SaleController;
use App\Http\Controllers\Api\Suppliers\SupplierController;
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
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('sales', SaleController::class);
    Route::post('sales/{sale}/cancel', SaleCancelController::class)->name('api.sales.cancel');
    Route::apiResource('account-receivables', AccountReceivableController::class)->only(['index', 'show']);
    Route::apiResource('purchases', PurchaseController::class);
    Route::post('purchases/{purchase}/cancel', PurchaseCancelController::class)->name('api.purchases.cancel');
    Route::apiResource('account-payables', AccountPayableController::class)->only(['index', 'show']);
    Route::post('account-payables/{accountPayable}/settle', AccountPayablePaymentController::class)->name('api.account-payables.settle');
});
