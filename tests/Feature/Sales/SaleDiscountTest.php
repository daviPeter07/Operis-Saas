<?php

use App\Models\AccountReceivable;
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
        'name' => 'Empresa Desconto',
        'document_type' => 'cnpj',
        'document' => '70000000000001',
        'address' => 'Rua Desconto',
        'phone' => '92999999999',
        'email' => 'desconto@test.com',
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
        'sku' => 'P-DESC',
        'sale_price' => 150,
        'cost' => 100,
        'stock' => 50,
        'status' => 'active',
    ]);

    // Two units at R$ 150,00: subtotal R$ 300,00.
    $this->salePayload = fn (array $attributes = []): array => [
        'date' => '2026-11-05',
        'payment_method' => 'cash',
        'status' => 'completed',
        'items' => [['product_id' => $this->product->id, 'quantity' => 2, 'unit_price' => 150]],
        ...$attributes,
    ];
});

test('a cash sale saves the discount and charges the discounted total', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['discount' => 50]))
        ->assertCreated()
        ->assertJsonPath('data.discount', 50)
        ->assertJsonPath('data.subtotal', '300.00')
        ->assertJsonPath('data.total', '250.00');

    $receivables = AccountReceivable::query()->where('sale_id', $response->json('data.id'))->get();

    expect($receivables)->toHaveCount(1)
        ->and($receivables->first()->amount)->toBe('250.00')
        ->and($receivables->first()->amount_paid)->toBe('250.00')
        ->and($receivables->first()->status)->toBe('received');
});

test('a sale without discount keeps the total equal to the subtotal', function () {
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)())
        ->assertCreated()
        ->assertJsonPath('data.discount', 0)
        ->assertJsonPath('data.total', '300.00');
});

test('a credit card sale splits the discounted total into the installments', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)([
            'payment_method' => 'card_credit',
            'status' => 'pending',
            'installments' => 3,
            'discount' => 30,
        ]))
        ->assertCreated()
        ->assertJsonPath('data.total', '270.00')
        ->assertJsonPath('data.installment_value', '90.00');

    $amounts = AccountReceivable::query()
        ->where('sale_id', $response->json('data.id'))
        ->orderBy('installment_number')
        ->pluck('amount')
        ->all();

    expect($amounts)->toBe(['90.00', '90.00', '90.00']);
});

test('a crediário sale finances the discounted total minus the entry', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)([
            'customer_id' => $this->customer->id,
            'payment_method' => 'crediario',
            'installments' => 3,
            'crediario_entry' => 100,
            'discount' => 50,
        ]))
        ->assertCreated()
        ->assertJsonPath('data.total', '250.00')
        ->assertJsonPath('data.installment_value', '50.00');

    $receivables = AccountReceivable::query()->where('sale_id', $response->json('data.id'))->get();
    $entry = $receivables->firstWhere('installment_number', null);
    $installments = $receivables->whereNotNull('installment_number');

    expect($entry->amount)->toBe('100.00')
        ->and($entry->status)->toBe('received')
        ->and($installments)->toHaveCount(3)
        ->and($installments->pluck('amount')->unique()->values()->all())->toBe(['50.00'])
        ->and($installments->pluck('status')->unique()->values()->all())->toBe(['pending']);
});

test('the crediário entry must be lower than the discounted total', function () {
    // R$ 250,00 is below the R$ 300,00 subtotal but equals the total after the discount.
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)([
            'customer_id' => $this->customer->id,
            'payment_method' => 'crediario',
            'installments' => 1,
            'crediario_entry' => 250,
            'discount' => 50,
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('crediario_entry');

    expect(Sale::query()->count())->toBe(0);
});

test('a discount above the items subtotal is rejected', function () {
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['discount' => 300.01]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['discount' => 'O desconto não pode ser maior que o subtotal dos itens.']);

    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['discount' => -1]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    expect(Sale::query()->count())->toBe(0)
        ->and($this->product->refresh()->stock)->toBe('50.00');
});

test('a discount equal to the subtotal makes the sale free', function () {
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['discount' => 300]))
        ->assertCreated()
        ->assertJsonPath('data.total', '0.00');
});

test('updating the discount recalculates the total and the receivables', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)([
            'payment_method' => 'card_credit',
            'status' => 'pending',
            'installments' => 2,
        ]))
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->salePayload)([
            'payment_method' => 'card_credit',
            'status' => 'pending',
            'installments' => 2,
            'discount' => 100,
        ]))
        ->assertOk()
        ->assertJsonPath('data.discount', 100)
        ->assertJsonPath('data.total', '200.00')
        ->assertJsonPath('data.installment_value', '100.00');

    $amounts = AccountReceivable::query()
        ->where('sale_id', $saleId)
        ->orderBy('installment_number')
        ->pluck('amount')
        ->all();

    expect($amounts)->toBe(['100.00', '100.00']);

    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->salePayload)(['discount' => 301]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    expect(Sale::query()->find($saleId)->total)->toBe('200.00');
});
