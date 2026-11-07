<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth('web')->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('home/index', [
        'seoTitle' => config('landing.seo.title'),
        'faq' => config('landing.faq'),
        'updates' => collect(config('landing.updates'))->sortByDesc('date')->take(3)->values(),
    ]);
})->name('home');

Route::inertia('termos-de-uso', 'home/terms')->name('terms');
Route::inertia('politica-de-privacidade', 'home/privacy')->name('privacy');

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::middleware(['auth'])->group(function (): void {
    Route::inertia('dashboard', 'dashboard/index')->name('dashboard');
    Route::inertia('dashboard/clients', 'dashboard/clients/index')->name('dashboard.clients');
    Route::get('dashboard/clients/{customer}', fn (int $customer) => Inertia::render('dashboard/clients/show', ['customerId' => $customer]))
        ->whereNumber('customer')
        ->name('dashboard.clients.show');
    Route::inertia('dashboard/sales', 'dashboard/sales/index')->name('dashboard.sales');
    Route::get('dashboard/sales/{sale}', fn (int $sale) => Inertia::render('dashboard/sales/show', ['saleId' => $sale]))
        ->whereNumber('sale')
        ->name('dashboard.sales.show');
    Route::inertia('dashboard/suppliers', 'dashboard/suppliers/index')->name('dashboard.suppliers');
    Route::get('dashboard/suppliers/{supplier}', fn (int $supplier) => Inertia::render('dashboard/suppliers/show', ['supplierId' => $supplier]))
        ->whereNumber('supplier')
        ->name('dashboard.suppliers.show');
    Route::inertia('dashboard/categories', 'dashboard/categories/index')->name('dashboard.categories');
    Route::inertia('dashboard/brands', 'dashboard/brands/index')->name('dashboard.brands');
    Route::inertia('dashboard/services', 'dashboard/services/index')->name('dashboard.services');
    Route::inertia('dashboard/inventory', 'dashboard/inventory/index')->name('dashboard.inventory');
    Route::get('dashboard/inventory/{product}', fn (int $product) => Inertia::render('dashboard/inventory/show', ['productId' => $product]))
        ->whereNumber('product')
        ->name('dashboard.inventory.show');
    Route::inertia('dashboard/purchases', 'dashboard/purchases/index')->name('dashboard.purchases');
    Route::get('dashboard/purchases/{purchase}', fn (int $purchase) => Inertia::render('dashboard/purchases/show', ['purchaseId' => $purchase]))
        ->whereNumber('purchase')
        ->name('dashboard.purchases.show');
    Route::inertia('dashboard/accounts-receivable', 'dashboard/accounts-receivable/index')->name('dashboard.accounts-receivable');
    Route::get('dashboard/accounts-receivable/{receivable}', fn (int $receivable) => Inertia::render('dashboard/accounts-receivable/show', ['receivableId' => $receivable]))
        ->whereNumber('receivable')
        ->name('dashboard.accounts-receivable.show');
    Route::inertia('dashboard/accounts-payable', 'dashboard/accounts-payable/index')->name('dashboard.accounts-payable');
    Route::get('dashboard/accounts-payable/{payable}', fn (int $payable) => Inertia::render('dashboard/accounts-payable/show', ['payableId' => $payable]))
        ->whereNumber('payable')
        ->name('dashboard.accounts-payable.show');
    Route::inertia('dashboard/store', 'dashboard/store/index')->name('dashboard.store');
    Route::inertia('dashboard/team', 'dashboard/team')->name('dashboard.team');
    Route::inertia('dashboard/reports', 'dashboard/reports')->name('dashboard.reports');
    Route::inertia('dashboard/reports/vendas', 'dashboard/reports/vendas')->name('dashboard.reports.vendas');
    Route::inertia('dashboard/reports/produtos-mais-vendidos', 'dashboard/reports/produtos-mais-vendidos')->name('dashboard.reports.produtosmaisvendidos');
    Route::inertia('dashboard/reports/vendas-categoria', 'dashboard/reports/vendas-categoria')->name('dashboard.reports.vendascategoria');
    Route::inertia('dashboard/reports/vendas-marca', 'dashboard/reports/vendas-marca')->name('dashboard.reports.vendasmarca');
    Route::inertia('dashboard/reports/estoque-atual', 'dashboard/reports/estoque-atual')->name('dashboard.reports.estoqueatual');
    Route::inertia('dashboard/reports/estoque-marca', 'dashboard/reports/estoque-marca')->name('dashboard.reports.estoquemarca');
    Route::inertia('dashboard/reports/inadimplencia', 'dashboard/reports/inadimplencia')->name('dashboard.reports.inadimplencia');
    Route::inertia('dashboard/reports/pagamentos-metodo', 'dashboard/reports/pagamentos-metodo')->name('dashboard.reports.pagamentosmetodo');
    Route::inertia('dashboard/reports/maiores-compradores', 'dashboard/reports/maiores-compradores')->name('dashboard.reports.maiorescompradores');
    Route::inertia('dashboard/reports/comprador-especifico', 'dashboard/reports/comprador-especifico')->name('dashboard.reports.compradorespecifico');
    Route::inertia('dashboard/settings', 'dashboard/settings')->name('dashboard.settings');
});
