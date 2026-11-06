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
        'name' => 'Empresa Parcelas',
        'document_type' => 'cnpj',
        'document' => '68000000000001',
        'address' => 'Rua Parcelas',
        'phone' => '92999999999',
        'email' => 'parcelas@test.com',
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
        'sku' => 'P-PARC',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->installments = function (array $attributes): array {
        $saleId = $this->actingAs($this->user)->postJson('/api/sales', [
            'date' => '2026-11-06',
            'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'unit_price' => 100]],
            ...$attributes,
        ])->assertCreated()->json('data.id');

        return AccountReceivable::query()
            ->where('sale_id', $saleId)
            ->whereNotNull('installment_number')
            ->orderBy('installment_number')
            ->get(['amount', 'amount_paid'])
            ->toArray();
    };
});

test('crediário installments add up to the financed total, the extra cents on the last one', function () {
    // Total 280, entry 60: 220 financed in 3.
    $installments = ($this->installments)([
        'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'unit_price' => 280]],
        'customer_id' => $this->customer->id,
        'payment_method' => 'crediario',
        'installments' => 3,
        'crediario_entry' => 60,
    ]);

    expect(array_column($installments, 'amount'))->toBe(['73.33', '73.33', '73.34']);
});

test('credit card installments add up to the total, also when the sale is paid', function () {
    $pending = ($this->installments)(['payment_method' => 'card_credit', 'status' => 'pending', 'installments' => 3]);
    $paid = ($this->installments)(['payment_method' => 'card_credit', 'status' => 'completed', 'installments' => 6, 'discount' => 0.01]);

    expect(array_column($pending, 'amount'))->toBe(['33.33', '33.33', '33.34'])
        // 99.99 / 6 = 16.665: five of 16.66 and 16.69.
        ->and(array_column($paid, 'amount'))->toBe(['16.66', '16.66', '16.66', '16.66', '16.66', '16.69'])
        ->and(array_column($paid, 'amount_paid'))->toBe(array_column($paid, 'amount'));
});

test('a total that divides evenly keeps equal installments', function () {
    $installments = ($this->installments)([
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        'payment_method' => 'card_credit',
        'status' => 'pending',
        'installments' => 3,
    ]);

    expect(array_column($installments, 'amount'))->toBe(['100.00', '100.00', '100.00']);
});
