<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseEvent;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Histórico Compras',
        'document_type' => 'cnpj',
        'document' => '92000000000001',
        'address' => 'Rua Histórico',
        'phone' => '92999999999',
        'email' => 'historico-compras@test.com',
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

    $this->supplier = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Distribuidora', 'status' => 'active']);
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Categoria', 'status' => 'active']);
    $this->product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-HIST',
        'sale_price' => 100,
        'cost' => 50,
        'stock' => 10,
        'status' => 'active',
    ]);

    // Three units at R$ 50,00: total R$ 150,00.
    $this->payload = fn (array $attributes = []): array => [
        'supplier_id' => $this->supplier->id,
        'date' => '2026-11-06',
        'payment_method' => 'pix',
        'status' => 'pending',
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_cost' => 50]],
        ...$attributes,
    ];

    $this->history = fn (int $purchaseId): array => PurchaseEvent::query()
        ->where('purchase_id', $purchaseId)
        ->orderBy('occurred_at')
        ->orderBy('id')
        ->get()
        ->map(fn (PurchaseEvent $event): string => $event->description)
        ->all();

    $this->payable = fn (int $purchaseId, int $number): AccountPayable => AccountPayable::query()
        ->where('purchase_id', $purchaseId)
        ->where('installment_number', $number)
        ->firstOrFail();
});

test('a cash purchase records registered, payment and completion', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)(['payment_method' => 'cash', 'status' => 'completed']))
        ->assertCreated()
        ->json('data.id');

    expect(($this->history)($id))->toBe(['Compra registrada', 'Pagamento feito', 'Compra concluída'])
        ->and(Purchase::query()->find($id)->completed_at)->not->toBeNull();
});

test('boleto payments from the summary and from contas a pagar are recorded one by one', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)([
            'payment_method' => 'boleto',
            'boleto_term_days' => 90,
            'paid_installments' => [1],
        ]))
        ->assertCreated()
        ->json('data.id');

    expect(($this->history)($id))->toBe(['Compra registrada', 'Boleto 1 pago']);

    $this->actingAs($this->user)
        ->postJson('/api/account-payables/'.($this->payable)($id, 2)->id.'/partial-settle', [
            'amount' => 20,
            'paid_at' => '2026-12-06',
            'paid_method' => 'pix',
        ])->assertOk();
    $this->actingAs($this->user)
        ->postJson('/api/account-payables/'.($this->payable)($id, 2)->id.'/settle', ['paid_at' => '2026-12-06', 'paid_method' => 'pix'])
        ->assertOk();
    $this->actingAs($this->user)
        ->postJson('/api/account-payables/'.($this->payable)($id, 3)->id.'/settle', ['paid_at' => '2027-01-05', 'paid_method' => 'pix'])
        ->assertOk();

    expect(($this->history)($id))->toBe([
        'Compra registrada',
        'Boleto 1 pago',
        'Pagamento parcial do boleto 2',
        'Boleto 2 pago',
        'Boleto 3 pago',
        'Compra concluída',
    ])->and(PurchaseEvent::query()->where('purchase_id', $id)->where('description', 'Boleto 2 pago')->value('amount'))->toBe('30.00');

    $this->actingAs($this->user)
        ->postJson('/api/account-payables/'.($this->payable)($id, 3)->id.'/unsettle')
        ->assertOk();

    expect(($this->history)($id))->toContain('Pagamento do boleto 3 desfeito')
        ->and(Purchase::query()->find($id)->status)->toBe('pending')
        ->and(Purchase::query()->find($id)->completed_at)->toBeNull();
});

test('editing the notes records the edit without repeating payments', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)([
            'payment_method' => 'boleto',
            'boleto_term_days' => 60,
            'paid_installments' => [1],
        ]))
        ->json('data.id');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [1],
        'notes' => 'Conferido',
    ]))->assertOk();

    expect(($this->history)($id))->toBe(['Compra registrada', 'Boleto 1 pago', 'Compra editada']);
});

test('unmarking a boleto on the edit records the undone payment', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)([
            'payment_method' => 'boleto',
            'boleto_term_days' => 60,
            'paid_installments' => [1],
        ]))
        ->json('data.id');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [2],
    ]))->assertOk();

    expect(($this->history)($id))->toBe([
        'Compra registrada',
        'Boleto 1 pago',
        'Compra editada',
        'Pagamento do boleto 1 desfeito',
        'Boleto 2 pago',
    ]);
});

test('cancelling records the cancellation and the details return the history oldest first', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->json('data.id');

    $this->actingAs($this->user)->postJson("/api/purchases/{$id}/cancel")->assertNoContent();

    $this->actingAs($this->user)->getJson("/api/purchases/{$id}")
        ->assertOk()
        ->assertJsonPath('data.history.0.description', 'Compra registrada')
        ->assertJsonPath('data.history.1.description', 'Compra cancelada')
        ->assertJsonPath('data.history.1.type', 'cancelled');

    expect(Purchase::query()->find($id)->cancelled_at)->not->toBeNull();

    $this->actingAs($this->user)->getJson('/api/purchases')
        ->assertOk()
        ->assertJsonMissingPath('data.0.history');
});

test('deleting a purchase removes its history', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->json('data.id');

    $this->actingAs($this->user)->deleteJson("/api/purchases/{$id}")->assertNoContent();

    expect(PurchaseEvent::query()->where('purchase_id', $id)->exists())->toBeFalse();
});

test('the backfill builds the history of purchases saved before it existed', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)([
            'payment_method' => 'boleto',
            'boleto_term_days' => 60,
            'paid_installments' => [1, 2],
        ]))
        ->json('data.id');

    // As if the purchase had been saved before the history existed.
    PurchaseEvent::query()->where('purchase_id', $id)->delete();
    DB::table('purchases')->where('id', $id)->update(['completed_at' => null]);

    (require database_path('migrations/2026_11_06_000600_backfill_purchase_history.php'))->up();

    expect(($this->history)($id))->toBe(['Compra registrada', 'Boleto 1 pago', 'Boleto 2 pago', 'Compra concluída'])
        ->and(Purchase::query()->find($id)->completed_at)->not->toBeNull();

    // Running it again changes nothing.
    (require database_path('migrations/2026_11_06_000600_backfill_purchase_history.php'))->up();

    expect(PurchaseEvent::query()->where('purchase_id', $id)->count())->toBe(4);
});
