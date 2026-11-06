<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Entrega',
        'document_type' => 'cnpj',
        'document' => '67000000000001',
        'address' => 'Rua Entrega',
        'phone' => '92999999999',
        'email' => 'entrega@test.com',
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
        'sku' => 'P-ENT',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->payload = fn (array $attributes = []): array => [
        'date' => '2026-11-06',
        'payment_method' => 'pix',
        'status' => 'pending',
        'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'unit_price' => 100]],
        ...$attributes,
    ];
    $this->show = fn (int $saleId) => $this->actingAs($this->user)->getJson("/api/sales/{$saleId}")->assertOk();
    $this->deliveredEvents = fn (int $saleId): int => collect(($this->show)($saleId)->json('data.history'))
        ->where('type', 'delivered')
        ->count();

    // 10:00 in Manaus.
    $this->travelTo(Carbon::parse('2026-11-06 14:00:00', 'UTC'));
});

test('a sale saves its notes and can be marked as delivered when registered', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['notes' => 'Entregar no período da tarde', 'delivered' => true]))
        ->assertCreated()
        ->assertJsonPath('data.notes', 'Entregar no período da tarde')
        ->assertJsonPath('data.delivered_at', '2026-11-06 10:00:00')
        ->json('data.id');

    $history = ($this->show)($saleId)->json('data.history');

    expect(collect($history)->last())->toBe([
        'type' => 'delivered',
        'occurred_at' => '2026-11-06 10:00:00',
        'description' => 'Venda marcada como entregue',
        'amount' => null,
    ]);
});

test('without notes or delivery the sale has neither', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)())
        ->assertCreated()
        ->assertJsonPath('data.notes', null)
        ->assertJsonPath('data.delivered_at', null)
        ->json('data.id');

    expect(($this->deliveredEvents)($saleId))->toBe(0);
});

test('editing marks, unmarks and marks the delivery again', function () {
    $saleId = $this->actingAs($this->user)->postJson('/api/sales', ($this->payload)())->assertCreated()->json('data.id');

    $this->travel(1)->hours();
    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)(['delivered' => true]))
        ->assertOk()
        ->assertJsonPath('data.delivered_at', '2026-11-06 11:00:00');

    // Saving again while delivered keeps the first moment and records nothing new.
    $this->travel(1)->hours();
    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)(['delivered' => true]))
        ->assertJsonPath('data.delivered_at', '2026-11-06 11:00:00');
    expect(($this->deliveredEvents)($saleId))->toBe(1);

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)(['delivered' => false]))
        ->assertJsonPath('data.delivered_at', null);

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)(['delivered' => true]))
        ->assertJsonPath('data.delivered_at', '2026-11-06 12:00:00');
    expect(($this->deliveredEvents)($saleId))->toBe(2);
});

test('an edit that does not send notes or delivery keeps them', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['notes' => 'Cliente retira na loja', 'delivered' => true]))
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)())
        ->assertOk()
        ->assertJsonPath('data.notes', 'Cliente retira na loja')
        ->assertJsonPath('data.delivered_at', '2026-11-06 10:00:00');

    $this->actingAs($this->user)->putJson("/api/sales/{$saleId}", ($this->payload)(['notes' => null]))
        ->assertJsonPath('data.notes', null);
});

test('rejects notes longer than 1000 characters and a non boolean delivery', function () {
    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['notes' => str_repeat('a', 1001), 'delivered' => 'talvez']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['notes', 'delivered']);

    $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->payload)(['notes' => str_repeat('a', 1000)]))
        ->assertCreated();
});
