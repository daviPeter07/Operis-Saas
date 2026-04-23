<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home', [
    'message' => 'Landing page coming soon.',
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard', [
        'message' => 'hello world',
    ])->name('dashboard');
});
