<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Vencimento',
        'document_type' => 'cnpj',
        'document' => '66000000000001',
        'address' => 'Rua Vencimento',
        'phone' => '92999999999',
        'email' => 'vencimento@test.com',
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
        'sku' => 'P-VENC',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->crediario = fn (array $attributes = []): array => [
        'customer_id' => $this->customer->id,
        'date' => '2026-11-06',
        'payment_method' => 'crediario',
        'installments' => 3,
        'crediario_entry' => 60,
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        ...$attributes,
    ];
    $this->dueDates = fn (int $saleId): array => AccountReceivable::query()
        ->where('sale_id', $saleId)
        ->whereNotNull('installment_number')
        ->orderBy('installment_number')
        ->get()
        ->map(fn (AccountReceivable $receivable): string => $receivable->due_date->toDateString())
        ->all();
});

test('the first crediário installment is due on the chosen date and the next ones monthly', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediario)(['first_installment_date' => '2026-12-15']))
        ->assertCreated()
        ->assertJsonPath('data.first_installment_date', '2026-12-15')
        ->json('data.id');

    expect(($this->dueDates)($saleId))->toBe(['2026-12-15', '2027-01-15', '2027-02-15']);
});

test('installments starting at the end of a month stay inside each month', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediario)(['first_installment_date' => '2027-01-31']))
        ->assertCreated()
        ->json('data.id');

    expect(($this->dueDates)($saleId))->toBe(['2027-01-31', '2027-02-28', '2027-03-31']);
});

test('without a chosen date the first installment is due 30 days after the sale', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediario)())
        ->assertCreated()
        ->assertJsonPath('data.first_installment_date', '2026-12-06')
        ->json('data.id');

    expect(($this->dueDates)($saleId))->toBe(['2026-12-06', '2027-01-06', '2027-02-06']);
});

test('editing the chosen date moves the installments', function () {
    $saleId = $this->actingAs($this->user)->postJson('/api/sales', ($this->crediario)())->assertCreated()->json('data.id');

    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->crediario)(['first_installment_date' => '2026-11-20']))
        ->assertOk();

    expect(($this->dueDates)($saleId))->toBe(['2026-11-20', '2026-12-20', '2027-01-20']);
});
