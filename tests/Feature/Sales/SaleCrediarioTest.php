<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;

test('crediario sale uses customer credit settings and creates receivable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Cred',
        'document_type' => 'cnpj',
        'document' => '50000000000001',
        'address' => 'Rua Cred',
        'phone' => '92999999991',
        'email' => 'cred@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $user->update(['current_company_id' => $company->id]);
    $customer = Customer::query()->create([
        'company_id' => $company->id,
        'name' => 'Cliente Cred',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 500,
        'credit_term_days' => 45,
    ]);
    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Marca',
        'status' => 'active',
    ]);
    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Cat',
        'status' => 'active',
    ]);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto Cred',
        'sku' => 'P-CRED',
        'sale_price' => 150,
        'cost' => 100,
        'stock' => 10,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/sales', [
        'customer_id' => $customer->id,
        'date' => '2026-05-06',
        'status' => 'completed',
        'payment_method' => 'crediario',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 150,
        ]],
    ])->assertCreated();

    $saleId = $response->json('data.id');

    $this->assertDatabaseHas('sales', [
        'id' => $saleId,
        'status' => 'pending',
        'payment_method' => 'crediario',
        'customer_id' => $customer->id,
    ]);

    $receivable = AccountReceivable::query()->where('sale_id', $saleId)->firstOrFail();

    expect($receivable->due_date?->toDateString())->toBe(Carbon::parse('2026-05-06')->addDays(45)->toDateString())
        ->and($receivable->amount)->toBe('300.00');
});

test('crediario sale respects customer credit limit', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Limite',
        'document_type' => 'cnpj',
        'document' => '50000000000002',
        'address' => 'Rua Limite',
        'phone' => '92999999992',
        'email' => 'limite@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $user->update(['current_company_id' => $company->id]);
    $customer = Customer::query()->create([
        'company_id' => $company->id,
        'name' => 'Cliente Limite',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 100,
        'credit_term_days' => 30,
    ]);
    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Marca',
        'status' => 'active',
    ]);
    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Cat',
        'status' => 'active',
    ]);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto Limite',
        'sku' => 'P-LIMIT',
        'sale_price' => 60,
        'cost' => 20,
        'stock' => 10,
        'status' => 'active',
    ]);

    AccountReceivable::query()->create([
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'sale_id' => null,
        'installment_number' => null,
        'entry_date' => now()->toDateString(),
        'due_date' => now()->addDays(30)->toDateString(),
        'item' => 'Saldo anterior',
        'description' => null,
        'amount' => 90,
        'status' => 'pending',
    ]);

    $this->actingAs($user)->postJson('/api/sales', [
        'customer_id' => $customer->id,
        'date' => now()->toDateString(),
        'status' => 'pending',
        'payment_method' => 'crediario',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 20,
        ]],
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['payment_method']);
});
