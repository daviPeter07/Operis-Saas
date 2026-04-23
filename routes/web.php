<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home', [
    'message' => 'Landing page coming soon.',
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard/index')->name('dashboard');
    Route::inertia('dashboard/clients', 'dashboard/clients')->name('dashboard.clients');
    Route::inertia('dashboard/sales', 'dashboard/sales')->name('dashboard.sales');
    Route::inertia('dashboard/suppliers', 'dashboard/suppliers')->name('dashboard.suppliers');
    Route::inertia('dashboard/products', 'dashboard/products')->name('dashboard.products');
    Route::inertia('dashboard/categories', 'dashboard/categories')->name('dashboard.categories');
    Route::inertia('dashboard/brands', 'dashboard/brands')->name('dashboard.brands');
    Route::inertia('dashboard/inventory', 'dashboard/inventory')->name('dashboard.inventory');
    Route::inertia('dashboard/purchases', 'dashboard/purchases')->name('dashboard.purchases');
    Route::inertia('dashboard/accounts-receivable', 'dashboard/accounts-receivable')->name('dashboard.accounts-receivable');
    Route::inertia('dashboard/accounts-payable', 'dashboard/accounts-payable')->name('dashboard.accounts-payable');
    Route::inertia('dashboard/team', 'dashboard/team')->name('dashboard.team');
    Route::inertia('dashboard/reports', 'dashboard/reports')->name('dashboard.reports');
    Route::inertia('dashboard/settings', 'dashboard/settings')->name('dashboard.settings');
});
