<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Compras',
        'document_type' => 'cnpj',
        'document' => '80000000000001',
        'address' => 'Rua Compras',
        'phone' => '92999999999',
        'email' => 'compras@test.com',
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

    $this->supplier = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Distribuidora Norte', 'status' => 'active']);
    $this->otherSupplier = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Atacado Sul', 'status' => 'active']);
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $this->category = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Periféricos', 'status' => 'active']);
    $this->product = Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => $this->category->id,
        'brand_id' => $brand->id,
        'name' => 'Teclado USB',
        'sku' => 'P-TEC',
        'sale_price' => 80,
        'cost' => 40,
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->payload = fn (array $attributes = []): array => [
        'supplier_id' => $this->supplier->id,
        'date' => '2026-11-07',
        'payment_method' => 'pix',
        'status' => 'pending',
        'items' => [['product_id' => $this->product->id, 'quantity' => 5, 'unit_cost' => 40]],
        ...$attributes,
    ];
});

test('the listing filters by supplier, product, status and payment method on the server', function () {
    $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->assertCreated();
    $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'supplier_id' => $this->otherSupplier->id,
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'items' => [['product_id' => $this->product->id, 'quantity' => 10, 'unit_cost' => 40]],
    ]))->assertCreated();

    $this->actingAs($this->user)->getJson('/api/purchases?filter[supplier]=norte')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.supplier_name', 'Distribuidora Norte');

    $this->actingAs($this->user)->getJson('/api/purchases?filter[payment_method]=boleto')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.boleto_term_days', 60);

    $this->actingAs($this->user)->getJson('/api/purchases?filter[product]=teclado&filter[category_id]='.$this->category->id)
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->actingAs($this->user)->getJson('/api/purchases?sort=total&direction=asc')
        ->assertOk()
        ->assertJsonPath('data.0.total', '200.00')
        ->assertJsonPath('data.1.total', '400.00');

    $this->actingAs($this->user)->getJson('/api/purchases?filter[status]=completed')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('the listing without parameters keeps answering as before', function () {
    $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->assertCreated();

    $this->actingAs($this->user)->getJson('/api/purchases')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.per_page', 15);
});

test('notes are saved and only change when the edit sends them', function () {
    $id = $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)(['notes' => 'Entregar no depósito']))
        ->assertCreated()
        ->assertJsonPath('data.notes', 'Entregar no depósito')
        ->json('data.id');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)())->assertOk();
    expect(Purchase::query()->find($id)->notes)->toBe('Entregar no depósito');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)(['notes' => null]))->assertOk();
    expect(Purchase::query()->find($id)->notes)->toBeNull();
});

test('notes above 1000 characters are rejected', function () {
    $this->actingAs($this->user)
        ->postJson('/api/purchases', ($this->payload)(['notes' => str_repeat('a', 1001)]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('notes');
});

test('deleting a cancelled purchase does not take the stock out twice', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->json('data.id');
    expect($this->product->fresh()->stock)->toBe('15.00');

    $this->actingAs($this->user)->postJson("/api/purchases/{$id}/cancel")->assertNoContent();
    expect($this->product->fresh()->stock)->toBe('10.00');

    $this->actingAs($this->user)->deleteJson("/api/purchases/{$id}")->assertNoContent();
    expect($this->product->fresh()->stock)->toBe('10.00');
});

test('editing a purchase with the same product in two lines adds both lines to the stock', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)())->json('data.id');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'items' => [
            ['product_id' => $this->product->id, 'quantity' => 3, 'unit_cost' => 40],
            ['product_id' => $this->product->id, 'quantity' => 4, 'unit_cost' => 35],
        ],
    ]))->assertOk();

    expect($this->product->fresh()->stock)->toBe('17.00');

    $this->actingAs($this->user)->deleteJson("/api/purchases/{$id}")->assertNoContent();
    expect($this->product->fresh()->stock)->toBe('10.00');
});

test('a boleto purchase lists its payables with due dates on the details endpoint', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 90,
        'items' => [['product_id' => $this->product->id, 'quantity' => 1, 'unit_cost' => 100]],
    ]))->json('data.id');

    $this->actingAs($this->user)->getJson("/api/purchases/{$id}")
        ->assertOk()
        ->assertJsonPath('data.supplier_name', 'Distribuidora Norte')
        ->assertJsonCount(3, 'data.payables')
        ->assertJsonPath('data.payables.0.due_date', '2026-12-07')
        ->assertJsonPath('data.payables.0.amount', '33.34')
        ->assertJsonPath('data.payables.2.due_date', '2027-02-05')
        ->assertJsonPath('data.payables.2.amount', '33.33');
});

test('editing only the notes keeps a boleto paid in contas a pagar', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
    ]))->json('data.id');
    $first = AccountPayable::query()->where('purchase_id', $id)->where('installment_number', 1)->firstOrFail();

    $this->actingAs($this->user)->postJson("/api/account-payables/{$first->id}/settle", [
        'paid_at' => '2026-12-07',
        'paid_method' => 'pix',
    ])->assertOk();

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'notes' => 'Conferido',
        'supplier_id' => $this->otherSupplier->id,
    ]))->assertOk();

    $payables = AccountPayable::query()->where('purchase_id', $id)->orderBy('installment_number')->get();
    expect($payables)->toHaveCount(2)
        ->and($payables[0]->status)->toBe('paid')
        ->and($payables[0]->supplier_id)->toBe($this->otherSupplier->id)
        ->and($payables[1]->status)->toBe('pending');
});

test('changing the value of a pending purchase with a paid boleto is refused', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
    ]))->json('data.id');
    $first = AccountPayable::query()->where('purchase_id', $id)->where('installment_number', 1)->firstOrFail();

    $this->actingAs($this->user)->postJson("/api/account-payables/{$first->id}/settle", [
        'paid_at' => '2026-12-07',
        'paid_method' => 'pix',
    ])->assertOk();

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'items' => [['product_id' => $this->product->id, 'quantity' => 6, 'unit_cost' => 40]],
    ]))->assertUnprocessable()->assertJsonValidationErrors('purchase');

    expect($first->fresh()->status)->toBe('paid')
        ->and($this->product->fresh()->stock)->toBe('15.00');
});

test('boletos marked as paid on the summary are settled and the purchase stays pending', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 90,
        'paid_installments' => [1],
    ]))->assertCreated()->assertJsonPath('data.status', 'pending')->json('data.id');

    $payables = AccountPayable::query()->where('purchase_id', $id)->orderBy('installment_number')->get();
    expect($payables->pluck('status')->all())->toBe(['paid', 'pending', 'pending'])
        ->and($payables[0]->amount_paid)->toBe($payables[0]->amount)
        ->and($payables[0]->paid_method)->toBe('boleto');
});

test('marking every boleto as paid completes the purchase', function () {
    $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [1, 2],
    ]))->assertCreated()->assertJsonPath('data.status', 'completed');
});

test('the edit can mark and unmark paid boletos', function () {
    $id = $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [1],
    ]))->json('data.id');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [2],
    ]))->assertOk()->assertJsonPath('data.status', 'pending');

    expect(AccountPayable::query()->where('purchase_id', $id)->orderBy('installment_number')->pluck('status')->all())
        ->toBe(['pending', 'paid']);

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'status' => 'completed',
        'paid_installments' => [1, 2],
    ]))->assertOk()->assertJsonPath('data.status', 'completed');

    $this->actingAs($this->user)->putJson("/api/purchases/{$id}", ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'status' => 'pending',
        'paid_installments' => [1],
    ]))->assertOk()->assertJsonPath('data.status', 'pending');

    expect(AccountPayable::query()->where('purchase_id', $id)->orderBy('installment_number')->pluck('status')->all())
        ->toBe(['paid', 'pending']);
});

test('a boleto number above 5 is rejected', function () {
    $this->actingAs($this->user)->postJson('/api/purchases', ($this->payload)([
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'paid_installments' => [6],
    ]))->assertUnprocessable()->assertJsonValidationErrors('paid_installments.0');
});
