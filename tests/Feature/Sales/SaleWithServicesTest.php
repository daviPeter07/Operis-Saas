<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Venda Serviço',
        'document_type' => 'cnpj',
        'document' => '97000000000001',
        'address' => 'Rua Serviço',
        'phone' => '92999999999',
        'email' => 'vendaservico@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $this->company->id, 'user_id' => $this->user->id, 'role' => 'owner', 'status' => 'active']);
    $this->user->update(['current_company_id' => $this->company->id]);

    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Categoria', 'status' => 'active']);
    $this->product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Cartucho',
        'sku' => 'CART-1',
        'sale_price' => 50,
        'cost' => 20,
        'stock' => 10,
        'status' => 'active',
    ]);
    $this->service = Service::query()->create([
        'company_id' => $this->company->id,
        'name' => 'Manutenção de impressora',
        'price' => 200,
        'cost' => 90,
        'status' => 'active',
    ]);
    $this->customer = Customer::query()->create([
        'company_id' => $this->company->id,
        'name' => 'Cliente',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 5000,
        'credit_term_days' => 90,
    ]);

    $this->payload = fn (array $items, array $overrides = []): array => [
        'date' => '2026-11-06',
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => $items,
        ...$overrides,
    ];
    $this->serviceItem = fn (float $quantity = 1, float $price = 200): array => ['service_id' => $this->service->id, 'quantity' => $quantity, 'unit_price' => $price];
    $this->productItem = fn (float $quantity = 1): array => ['product_id' => $this->product->id, 'quantity' => $quantity, 'unit_price' => 50];
});

test('a sale with only services moves no stock and creates its receivables', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->serviceItem)(2, 180)], [
        'customer_id' => $this->customer->id,
        'payment_method' => 'crediario',
        'installments' => 2,
    ]))->assertCreated()
        ->assertJsonPath('data.total', '360.00')
        ->assertJsonPath('data.items.0.type', 'service')
        ->assertJsonPath('data.items.0.name', 'Manutenção de impressora')
        ->assertJsonPath('data.items.0.service_id', $this->service->id)
        ->assertJsonPath('data.items.0.product_id', null);

    $saleId = $response->json('data.id');

    expect($this->product->fresh()->stock)->toEqual(10);
    $this->assertDatabaseMissing('stock_movements', ['reference_id' => $saleId]);
    $this->assertDatabaseCount('account_receivables', 2);
    $this->assertDatabaseHas('account_receivables', ['sale_id' => $saleId, 'item' => 'Manutenção de impressora']);
});

test('a mixed sale moves only the products and the profit uses the service cost', function () {
    $response = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([
        ($this->productItem)(3),
        ($this->serviceItem)(1),
    ]))->assertCreated();

    // Product: 3 x (50 - 20) = 90; service: 200 - 90 = 110.
    expect($this->product->fresh()->stock)->toEqual(7)
        ->and((float) $response->json('data.profit'))->toBe(200.0);

    $this->assertDatabaseHas('sale_items', ['sale_id' => $response->json('data.id'), 'service_id' => $this->service->id, 'unit_cost' => 90]);
});

test('a service without a cost earns its whole price', function () {
    $this->service->update(['cost' => null]);

    $response = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->serviceItem)(1, 150)]))->assertCreated();

    expect((float) $response->json('data.profit'))->toBe(150.0);
});

test('editing and cancelling a mixed sale keep the stock right', function () {
    $saleId = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([
        ($this->productItem)(2),
        ($this->serviceItem)(1),
    ]))->assertCreated()->json('data.id');

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)([
        ($this->productItem)(4),
        ($this->serviceItem)(3),
    ]))->assertOk();
    expect($this->product->fresh()->stock)->toEqual(6);

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)([($this->serviceItem)(1)]))->assertOk();
    expect($this->product->fresh()->stock)->toEqual(10);

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)([($this->productItem)(1), ($this->serviceItem)(1)]))->assertOk();
    $this->actingAs($this->user)->postJson("/api/sales/{$saleId}/cancel")->assertSuccessful();
    expect($this->product->fresh()->stock)->toEqual(10);
});

test('an inactive service cannot be sold, but a sale that has it can still be edited', function () {
    $saleId = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->serviceItem)(1)]))->assertCreated()->json('data.id');
    $this->service->update(['status' => 'inactive']);

    $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->serviceItem)(1)]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('items.0.service_id');

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)([($this->serviceItem)(2)]))->assertOk();
});

test('an item must be a product or a service, not both and not neither', function () {
    $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([
        ['product_id' => $this->product->id, 'service_id' => $this->service->id, 'quantity' => 1, 'unit_price' => 50],
    ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');

    $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([
        ['quantity' => 1, 'unit_price' => 50],
    ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');
});

test('the sales list filters by service and the product filter matches service names', function () {
    $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->productItem)(1)]))->assertCreated();
    $withService = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)([($this->serviceItem)(1)]))->assertCreated()->json('data.id');

    $this->actingAs($this->user)->getJson("/api/sales?filter[service_id]={$this->service->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $withService);

    $this->actingAs($this->user)->getJson('/api/sales?filter[product]=impressora')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $withService);

    $this->actingAs($this->user)->getJson('/api/services')
        ->assertOk()
        ->assertJsonPath('data.0.performed_count', 1);
});
