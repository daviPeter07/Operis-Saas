<?php

use App\Http\Controllers\Api\Auth\AuthenticatedUserController;
use App\Http\Controllers\Api\Brands\BrandController;
use App\Http\Controllers\Api\Brands\BrandImportController;
use App\Http\Controllers\Api\Categories\CategoryController;
use App\Http\Controllers\Api\Categories\CategoryImportController;
use App\Http\Controllers\Api\Customers\CustomerController;
use App\Http\Controllers\Api\Customers\CustomerImportController;
use App\Http\Controllers\Api\Finance\AccountPayableController;
use App\Http\Controllers\Api\Finance\AccountPayablePaymentController;
use App\Http\Controllers\Api\Finance\AccountReceivableController;
use App\Http\Controllers\Api\Finance\AccountReceivablePaymentController;
use App\Http\Controllers\Api\Onboarding\CompanyOnboardingController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationCodeController;
use App\Http\Controllers\Api\Onboarding\CompanyVerificationResendController;
use App\Http\Controllers\Api\Onboarding\OnboardingStateController;
use App\Http\Controllers\Api\Products\ProductController;
use App\Http\Controllers\Api\Products\ProductImportController;
use App\Http\Controllers\Api\Purchases\PurchaseCancelController;
use App\Http\Controllers\Api\Purchases\PurchaseController;
use App\Http\Controllers\Api\Sales\SaleCancelController;
use App\Http\Controllers\Api\Sales\SaleController;
use App\Http\Controllers\Api\Suppliers\SupplierController;
use App\Http\Controllers\Api\Suppliers\SupplierImportController;
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
        Route::get('state', [OnboardingStateController::class, 'index'])->name('api.onboarding.state');
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
    Route::post('customers/import', CustomerImportController::class)->name('api.customers.import');
    Route::apiResource('suppliers', SupplierController::class);
    Route::post('suppliers/import', SupplierImportController::class)->name('api.suppliers.import');
    Route::apiResource('brands', BrandController::class);
    Route::post('brands/import', BrandImportController::class)->name('api.brands.import');
    Route::apiResource('categories', CategoryController::class);
    Route::post('categories/import', CategoryImportController::class)->name('api.categories.import');
    Route::apiResource('products', ProductController::class);
    Route::post('products/import', ProductImportController::class)->name('api.products.import');
    Route::apiResource('sales', SaleController::class);
    Route::post('sales/{sale}/cancel', SaleCancelController::class)->name('api.sales.cancel');
    Route::apiResource('account-receivables', AccountReceivableController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::post('account-receivables/{accountReceivable}/settle', AccountReceivablePaymentController::class)->name('api.account-receivables.settle');
    Route::post('account-receivables/{accountReceivable}/partial-settle', [AccountReceivablePaymentController::class, 'partial'])->name('api.account-receivables.partial-settle');
    Route::post('account-receivables/{accountReceivable}/unsettle', [AccountReceivablePaymentController::class, 'reverse'])->name('api.account-receivables.unsettle');
    Route::apiResource('purchases', PurchaseController::class);
    Route::post('purchases/{purchase}/cancel', PurchaseCancelController::class)->name('api.purchases.cancel');
    Route::apiResource('account-payables', AccountPayableController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::post('account-payables/{accountPayable}/settle', AccountPayablePaymentController::class)->name('api.account-payables.settle');
    Route::post('account-payables/{accountPayable}/partial-settle', [AccountPayablePaymentController::class, 'partial'])->name('api.account-payables.partial-settle');
    Route::post('account-payables/{accountPayable}/unsettle', [AccountPayablePaymentController::class, 'reverse'])->name('api.account-payables.unsettle');
});
