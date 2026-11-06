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
use App\Services\Finance\ReceivableService;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Cancelamento',
        'document_type' => 'cnpj',
        'document' => '64000000000001',
        'address' => 'Rua Cancelamento',
        'phone' => '92999999999',
        'email' => 'cancelamento@test.com',
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
        'sku' => 'P-CANC',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'status' => 'active',
    ]);

    // Three units at R$ 100,00.
    $this->createSale = fn (array $attributes = []): int => $this->actingAs($this->user)->postJson('/api/sales', [
        'date' => '2026-11-06',
        'payment_method' => 'cash',
        'status' => 'completed',
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        ...$attributes,
    ])->assertCreated()->json('data.id');
    $this->crediarioSale = fn (array $attributes = []): int => ($this->createSale)([
        'customer_id' => $this->customer->id,
        'payment_method' => 'crediario',
        'installments' => 3,
        'crediario_entry' => 60,
        ...$attributes,
    ]);
    $this->cancel = fn (int $saleId) => $this->actingAs($this->user)->postJson("/api/sales/{$saleId}/cancel")->assertNoContent();
    $this->receivableStatuses = fn (int $saleId): array => AccountReceivable::query()
        ->where('sale_id', $saleId)
        ->orderByRaw('installment_number is null desc')
        ->orderBy('installment_number')
        ->pluck('status')
        ->all();
});

test('cancelling a pending sale gives the stock back and cancels what is still owed', function () {
    $saleId = ($this->createSale)(['status' => 'pending', 'payment_method' => 'pix']);
    expect($this->product->refresh()->stock)->toBe('7.00');

    ($this->cancel)($saleId);

    expect($this->product->refresh()->stock)->toBe('10.00')
        ->and(($this->receivableStatuses)($saleId))->toBe(['cancelled'])
        ->and(Sale::query()->find($saleId)->status)->toBe('cancelled');
});

test('cancelling a crediário sale keeps the received payments and cancels the open installments', function () {
    $saleId = ($this->crediarioSale)(['paid_installments' => [1]]);
    $installment2 = AccountReceivable::query()->where('sale_id', $saleId)->where('installment_number', 2)->firstOrFail();
    app(ReceivableService::class)->settlePartial($installment2, $this->user->id, ['amount' => 30, 'received_at' => '2026-11-06']);

    ($this->cancel)($saleId);

    // Entry, installment 1 (received), installment 2 (partly paid), installment 3 (open).
    expect(($this->receivableStatuses)($saleId))->toBe(['received', 'received', 'cancelled', 'cancelled'])
        ->and($installment2->refresh()->amount_paid)->toBe('30.00')
        ->and($this->product->refresh()->stock)->toBe('10.00');
});

test('cancelling twice or deleting a cancelled sale does not give the stock back twice', function () {
    $saleId = ($this->createSale)();

    ($this->cancel)($saleId);
    ($this->cancel)($saleId);
    expect($this->product->refresh()->stock)->toBe('10.00');

    $this->actingAs($this->user)->deleteJson("/api/sales/{$saleId}")->assertNoContent();
    expect($this->product->refresh()->stock)->toBe('10.00');
});

test('payments of a cancelled sale cannot be settled or undone', function () {
    $saleId = ($this->crediarioSale)(['paid_installments' => [1]]);
    ($this->cancel)($saleId);
    $cancelledAt = Sale::query()->find($saleId)->cancelled_at;

    $paid = AccountReceivable::query()->where('sale_id', $saleId)->where('installment_number', 1)->firstOrFail();
    $open = AccountReceivable::query()->where('sale_id', $saleId)->where('installment_number', 2)->firstOrFail();

    $this->actingAs($this->user)->postJson("/api/account-receivables/{$paid->id}/unsettle")
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['receivable' => 'Esta conta pertence a uma venda cancelada e não pode ser alterada.']);
    $this->actingAs($this->user)->postJson("/api/account-receivables/{$open->id}/settle", ['received_at' => '2026-11-06'])
        ->assertUnprocessable();
    $this->actingAs($this->user)->postJson("/api/account-receivables/{$open->id}/partial-settle", ['amount' => 10, 'received_at' => '2026-11-06'])
        ->assertUnprocessable();

    $sale = Sale::query()->find($saleId);

    expect($sale->status)->toBe('cancelled')
        ->and($sale->cancelled_at?->toDateTimeString())->toBe($cancelledAt->toDateTimeString())
        ->and($paid->refresh()->status)->toBe('received');
});

test('old cancelled sales lose their open receivables once, received ones stay', function () {
    $cancelledId = ($this->crediarioSale)(['paid_installments' => [1]]);
    $pendingId = ($this->crediarioSale)();
    // As the old cancel left it: status cancelled, installments untouched.
    DB::table('sales')->where('id', $cancelledId)->update(['status' => 'cancelled']);

    $migration = require database_path('migrations/2026_11_06_000100_cancel_open_receivables_of_cancelled_sales.php');
    $migration->up();
    $migration->up();

    expect(($this->receivableStatuses)($cancelledId))->toBe(['received', 'received', 'cancelled', 'cancelled'])
        ->and(($this->receivableStatuses)($pendingId))->toBe(['received', 'pending', 'pending', 'pending']);
});

test('the finance resync keeps money received before the cancellation', function () {
    $saleId = ($this->createSale)();
    DB::table('sales')->where('id', $saleId)->update(['status' => 'cancelled']);

    app(ReceivableService::class)->syncStatusesFromSales($this->company->id);

    expect(($this->receivableStatuses)($saleId))->toBe(['received']);
});
