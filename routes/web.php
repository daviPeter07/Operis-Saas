<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth('web')->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function (): void {
    Route::inertia('dashboard', 'dashboard/index')->name('dashboard');
    Route::inertia('dashboard/clients', 'dashboard/clients')->name('dashboard.clients');
    Route::inertia('dashboard/sales', 'dashboard/sales')->name('dashboard.sales');
    Route::inertia('dashboard/suppliers', 'dashboard/suppliers')->name('dashboard.suppliers');
    Route::inertia('dashboard/categories', 'dashboard/categories')->name('dashboard.categories');
    Route::inertia('dashboard/brands', 'dashboard/brands')->name('dashboard.brands');
    Route::inertia('dashboard/inventory', 'dashboard/inventory')->name('dashboard.inventory');
    Route::inertia('dashboard/purchases', 'dashboard/purchases')->name('dashboard.purchases');
    Route::inertia('dashboard/accounts-receivable', 'dashboard/accounts-receivable')->name('dashboard.accounts-receivable');
    Route::inertia('dashboard/accounts-payable', 'dashboard/accounts-payable')->name('dashboard.accounts-payable');
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
