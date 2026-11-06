<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\SaleEvent;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Crediário',
        'document_type' => 'cnpj',
        'document' => '90000000000001',
        'address' => 'Rua Crediário',
        'phone' => '92999999999',
        'email' => 'crediario@test.com',
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
        'name' => 'Cliente Crediário',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 1000,
        'credit_term_days' => 90,
    ]);
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Categoria', 'status' => 'active']);
    $this->product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-CRED',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 50,
        'status' => 'active',
    ]);

    // Three units at R$ 100,00: total R$ 300,00 in 3 installments.
    $this->payload = fn (array $attributes = []): array => [
        'customer_id' => $this->customer->id,
        'date' => '2026-11-06',
        'payment_method' => 'crediario',
        'status' => 'pending',
        'installments' => 3,
        'first_installment_date' => '2026-12-06',
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        ...$attributes,
    ];
});

test('a crediário sale can be saved without an entry and finances the whole total', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)())
        ->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->json('data.id');

    $receivables = AccountReceivable::query()->where('sale_id', $id)->orderBy('installment_number')->get();

    expect($receivables)->toHaveCount(3)
        ->and($receivables->whereNull('installment_number'))->toHaveCount(0)
        ->and($receivables->pluck('amount')->all())->toBe(['100.00', '100.00', '100.00'])
        ->and($receivables->pluck('status')->unique()->all())->toBe(['pending'])
        ->and(SaleEvent::query()->where('sale_id', $id)->where('type', 'payment_received')->exists())->toBeFalse();
});

test('an entry of zero is accepted as no entry', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['crediario_entry' => 0]))
        ->assertCreated()
        ->json('data.id');

    expect(AccountReceivable::query()->where('sale_id', $id)->sum('amount'))->toEqual(300);
});

test('a crediário without entry still respects the credit limit', function () {
    $this->customer->update(['credit_limit' => 250]);

    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)())
        ->assertUnprocessable()
        ->assertJsonValidationErrors('payment_method');
});

test('an entry equal to the total or negative is still refused', function () {
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['crediario_entry' => 300]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('crediario_entry');

    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['crediario_entry' => -10]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('crediario_entry');
});
