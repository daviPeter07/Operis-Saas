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

/**
 * 01:30 UTC on Nov 6 is 21:30 on Nov 5 in Manaus (UTC-4): the app must show
 * and record the Manaus date, not the UTC one.
 */
beforeEach(function () {
    $this->travelTo(Carbon::parse('2026-11-06 01:30:00', 'UTC'));

    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Manaus',
        'document_type' => 'cnpj',
        'document' => '50000000000001',
        'address' => 'Rua Manaus',
        'phone' => '92999999999',
        'email' => 'manaus@test.com',
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
});

test('business timezone is fixed to Manaus', function () {
    expect(config('app.business_timezone'))->toBe('America/Manaus')
        ->and(config('app.timezone'))->toBe('UTC');
});

test('registration dates are returned in Manaus time', function () {
    $this->actingAs($this->user)->postJson('/api/brands', ['name' => 'Marca Noturna'])->assertCreated();

    expect($this->actingAs($this->user)->getJson('/api/brands')->json('data.0.createdAt'))
        ->toBe('2026-11-05 21:30:00');
});

test('installments paid at checkout get the Manaus date as received date', function () {
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Cat', 'status' => 'active']);
    $product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-MAO',
        'sale_price' => 100,
        'cost' => 50,
        'stock' => 10,
        'status' => 'active',
    ]);
    $customer = Customer::query()->create([
        'company_id' => $this->company->id,
        'name' => 'Cliente Manaus',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 1000,
        'credit_term_days' => 60,
    ]);

    $this->actingAs($this->user)->postJson('/api/sales', [
        'customer_id' => $customer->id,
        'date' => '2026-11-05',
        'status' => 'pending',
        'payment_method' => 'crediario',
        'crediario_entry' => 50,
        'installments' => 2,
        'paid_installments' => [1],
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 100,
        ]],
    ])->assertCreated();

    $paidInstallment = AccountReceivable::query()->where('installment_number', 1)->firstOrFail();

    expect($paidInstallment->received_at->toDateString())->toBe('2026-11-05');
});
