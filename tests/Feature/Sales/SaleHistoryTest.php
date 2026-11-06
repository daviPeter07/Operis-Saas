<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleEvent;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Histórico',
        'document_type' => 'cnpj',
        'document' => '62000000000001',
        'address' => 'Rua Histórico',
        'phone' => '92999999999',
        'email' => 'historico@test.com',
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
        'name' => 'Cliente Histórico',
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
        'sku' => 'P-HIST',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 50,
        'status' => 'active',
    ]);

    // Three units at R$ 100,00: subtotal R$ 300,00.
    $this->salePayload = fn (array $attributes = []): array => [
        'date' => '2026-11-05',
        'payment_method' => 'cash',
        'status' => 'completed',
        'items' => [['product_id' => $this->product->id, 'quantity' => 3, 'unit_price' => 100]],
        ...$attributes,
    ];
    $this->crediarioPayload = fn (array $attributes = []): array => ($this->salePayload)([
        'customer_id' => $this->customer->id,
        'payment_method' => 'crediario',
        'installments' => 3,
        'crediario_entry' => 60,
        ...$attributes,
    ]);

    // 14:30 in Manaus.
    $this->travelTo(Carbon::parse('2026-11-05 18:30:00', 'UTC'));
});

function saleHistory(int $saleId): array
{
    return test()->actingAs(test()->user)->getJson("/api/sales/{$saleId}")->assertOk()->json('data.history');
}

function historyLines(int $saleId): array
{
    return collect(saleHistory($saleId))
        ->map(fn (array $event): string => $event['type'].' | '.$event['description'].' | '.($event['amount'] ?? 'null'))
        ->all();
}

function installmentOf(int $saleId, int $number): AccountReceivable
{
    return AccountReceivable::query()->where('sale_id', $saleId)->where('installment_number', $number)->firstOrFail();
}

test('a sale paid at the counter records registered, payment and completion', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['discount' => 20]))
        ->assertCreated()
        ->json('data.id');

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 280',
        'payment_received | Pagamento recebido | 280',
        'completed | Venda concluída | 280',
    ]);

    $this->actingAs($this->user)->getJson("/api/sales/{$saleId}")
        ->assertJsonPath('data.history.0.occurred_at', '2026-11-05 14:30:00')
        ->assertJsonPath('data.completed_at', '2026-11-05 14:30:00')
        ->assertJsonPath('data.cancelled_at', null);
});

test('editing a pending sale into a completed one records the edit, the payment and the completion', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['status' => 'pending', 'payment_method' => 'pix']))
        ->assertCreated()
        ->assertJsonPath('data.completed_at', null)
        ->json('data.id');

    $this->travel(2)->hours();
    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->salePayload)(['payment_method' => 'pix']))
        ->assertOk()
        ->assertJsonPath('data.completed_at', '2026-11-05 16:30:00');

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 300',
        'updated | Venda editada | 300',
        'payment_received | Pagamento recebido | 300',
        'completed | Venda concluída | 300',
    ]);

    // Editing a sale that is already completed does not record the payment again.
    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->salePayload)(['payment_method' => 'pix', 'discount' => 10]))
        ->assertOk();

    expect(historyLines($saleId))->toHaveCount(5)
        ->and(historyLines($saleId)[4])->toBe('updated | Venda editada | 290');
});

test('crediário payments, partial payments, completion and undoing a payment are recorded', function () {
    // Total 300, entry 60, three installments of 80; installment 1 paid at the counter.
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediarioPayload)(['paid_installments' => [1]]))
        ->assertCreated()
        ->json('data.id');

    $this->travel(1)->days();
    $this->actingAs($this->user)
        ->postJson('/api/account-receivables/'.installmentOf($saleId, 2)->id.'/settle', ['received_at' => '2026-11-06'])
        ->assertOk();

    $this->travel(1)->days();
    $this->actingAs($this->user)
        ->postJson('/api/account-receivables/'.installmentOf($saleId, 3)->id.'/partial-settle', ['amount' => 30, 'received_at' => '2026-11-07'])
        ->assertOk();

    expect(Sale::query()->find($saleId)->completed_at)->toBeNull();

    $this->travel(1)->days();
    $this->actingAs($this->user)
        ->postJson('/api/account-receivables/'.installmentOf($saleId, 3)->id.'/settle', ['received_at' => '2026-11-08'])
        ->assertOk();

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 300',
        'payment_received | Entrada recebida | 60',
        'payment_received | Parcela 1 recebida | 80',
        'payment_received | Parcela 2 recebida | 80',
        'payment_received | Pagamento parcial da parcela 3 recebido | 30',
        'payment_received | Parcela 3 recebida | 50',
        'completed | Venda concluída | 300',
    ]);

    $this->actingAs($this->user)->getJson("/api/sales/{$saleId}")
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonPath('data.completed_at', '2026-11-08 14:30:00')
        ->assertJsonPath('data.history.6.occurred_at', '2026-11-08 14:30:00');

    $this->travel(1)->hours();
    $this->actingAs($this->user)
        ->postJson('/api/account-receivables/'.installmentOf($saleId, 3)->id.'/unsettle', [])
        ->assertOk();

    expect(historyLines($saleId)[7])->toBe('updated | Recebimento da parcela 3 desfeito | 80');

    $this->actingAs($this->user)->getJson("/api/sales/{$saleId}")
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.completed_at', null);
});

test('a crediário sale paid in full at the counter is completed once', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediarioPayload)(['installments' => 2, 'paid_installments' => [1, 2]]))
        ->assertCreated()
        ->assertJsonPath('data.status', 'completed')
        ->json('data.id');

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 300',
        'payment_received | Entrada recebida | 60',
        'payment_received | Parcela 1 recebida | 120',
        'payment_received | Parcela 2 recebida | 120',
        'completed | Venda concluída | 300',
    ]);
});

test('editing a crediário sale does not repeat payments already in the history', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->crediarioPayload)(['paid_installments' => [1]]))
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($this->user)
        ->putJson("/api/sales/{$saleId}", ($this->crediarioPayload)(['paid_installments' => [1, 2]]))
        ->assertOk();

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 300',
        'payment_received | Entrada recebida | 60',
        'payment_received | Parcela 1 recebida | 80',
        'updated | Venda editada | 300',
        'payment_received | Parcela 2 recebida | 80',
    ]);
});

test('cancelling records the cancellation and keeps when the sale was completed', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)())
        ->assertCreated()
        ->json('data.id');

    $this->travel(30)->minutes();
    $this->actingAs($this->user)->postJson("/api/sales/{$saleId}/cancel")->assertNoContent();
    // Cancelling twice does nothing.
    $this->actingAs($this->user)->postJson("/api/sales/{$saleId}/cancel")->assertNoContent();

    expect(historyLines($saleId))->toBe([
        'created | Venda registrada | 300',
        'payment_received | Pagamento recebido | 300',
        'completed | Venda concluída | 300',
        'cancelled | Venda cancelada | 300',
    ]);

    $this->actingAs($this->user)->getJson("/api/sales/{$saleId}")
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.completed_at', '2026-11-05 14:30:00')
        ->assertJsonPath('data.cancelled_at', '2026-11-05 15:00:00');
});

test('the history is returned oldest first and only on the sale details', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)(['status' => 'pending']))
        ->assertCreated()
        ->assertJsonMissingPath('data.history')
        ->json('data.id');

    // An event saved later but dated earlier still comes first.
    SaleEvent::query()->create([
        'company_id' => $this->company->id,
        'sale_id' => $saleId,
        'type' => 'updated',
        'description' => 'Evento antigo',
        'amount' => null,
        'occurred_at' => now()->subDay(),
    ]);

    expect(saleHistory($saleId)[0])->toBe([
        'type' => 'updated',
        'occurred_at' => '2026-11-04 14:30:00',
        'description' => 'Evento antigo',
        'amount' => null,
    ]);

    $this->actingAs($this->user)->getJson('/api/sales')->assertJsonMissingPath('data.0.history');
});

test('deleting a sale removes its history', function () {
    $saleId = $this->actingAs($this->user)
        ->postJson('/api/sales', ($this->salePayload)())
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($this->user)->deleteJson("/api/sales/{$saleId}")->assertNoContent();

    expect(SaleEvent::query()->where('sale_id', $saleId)->count())->toBe(0);
});
