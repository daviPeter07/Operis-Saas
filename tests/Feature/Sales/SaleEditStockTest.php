<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Estoque',
        'document_type' => 'cnpj',
        'document' => '65000000000001',
        'address' => 'Rua Estoque',
        'phone' => '92999999999',
        'email' => 'estoque@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $this->company->id,
        'user_id' => $this->user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $this->user->update(['current_company_id' => $this->company->id]);

    $this->customer = Customer::query()->create([
        'company_id' => $this->company->id,
        'name' => 'Cliente',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 5000,
        'credit_term_days' => 90,
    ]);
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Categoria', 'status' => 'active']);
    $this->product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-EST',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->other = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Outro produto',
        'sku' => 'P-EST-2',
        'sale_price' => 50,
        'cost' => 20,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->payload = fn (array $attributes = []): array => [
        'date' => '2026-11-06',
        'payment_method' => 'cash',
        'status' => 'completed',
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        ...$attributes,
    ];
    $this->saleId = fn (array $attributes = []): int => $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)($attributes))
        ->assertCreated()
        ->json('data.id');
    $this->edit = fn (int $saleId, array $attributes) => $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->payload)($attributes))
        ->assertOk();
});

test('setting a completed sale back to pending does not put stock back', function () {
    $saleId = ($this->saleId)();
    ($this->edit)($saleId, ['status' => 'pending']);

    expect($this->product->refresh()->stock)->toBe('7.00');

    ($this->edit)($saleId, ['status' => 'completed']);

    expect($this->product->refresh()->stock)->toBe('7.00');
});

test('editing the items of a pending sale moves only the difference', function () {
    $saleId = ($this->saleId)(['status' => 'pending']);

    ($this->edit)($saleId, ['status' => 'pending', 'items' => [['product_id' => $this->product->id, 'quantity' => 5, 'unit_price' => 100]]]);
    expect($this->product->refresh()->stock)->toBe('5.00');

    ($this->edit)($saleId, ['status' => 'pending', 'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'unit_price' => 100]]]);
    expect($this->product->refresh()->stock)->toBe('9.00');
});

test('swapping products and repeating a product on two lines keep the stock right', function () {
    $saleId = ($this->saleId)();

    ($this->edit)($saleId, ['items' => [
        ['product_id' => $this->other->id, 'quantity' => 2, 'unit_price' => 50],
        ['product_id' => $this->other->id, 'quantity' => 1, 'unit_price' => 50],
    ]]);

    expect($this->product->refresh()->stock)->toBe('10.00')
        ->and($this->other->refresh()->stock)->toBe('7.00');
});

test('the quantity already in the sale counts as available when editing', function () {
    // All 10 units sold; editing the same sale keeps them without a stock error.
    $saleId = ($this->saleId)(['items' => [['product_id' => $this->product->id, 'quantity' => 10, 'unit_price' => 100]]]);

    ($this->edit)($saleId, ['status' => 'pending', 'items' => [['product_id' => $this->product->id, 'quantity' => 10, 'unit_price' => 90]]]);

    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->payload)(['items' => [['product_id' => $this->product->id, 'quantity' => 11, 'unit_price' => 90]]]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('stock');

    expect($this->product->refresh()->stock)->toBe('0.00');
});

test('a crediário sale completed by its payments keeps the stock it took', function () {
    $customer = Customer::query()->create([
        'company_id' => $this->company->id,
        'name' => 'Cliente',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 5000,
        'credit_term_days' => 30,
    ]);
    $crediario = ['customer_id' => $customer->id, 'payment_method' => 'crediario', 'installments' => 1, 'crediario_entry' => 100];
    $saleId = ($this->saleId)([...$crediario, 'paid_installments' => [1]]);
    expect(Sale::query()->find($saleId)->status)->toBe('completed');

    // Editing without the paid installment makes it pending again.
    ($this->edit)($saleId, $crediario);

    expect(Sale::query()->find($saleId)->status)->toBe('pending')
        ->and($this->product->refresh()->stock)->toBe('7.00');
});
