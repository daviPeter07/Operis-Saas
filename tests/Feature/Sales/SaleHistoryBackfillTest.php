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
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Backfill',
        'document_type' => 'cnpj',
        'document' => '63000000000001',
        'address' => 'Rua Backfill',
        'phone' => '92999999999',
        'email' => 'backfill@test.com',
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
    $this->customer = Customer::query()->create(['company_id' => $this->company->id, 'name' => 'Cliente', 'status' => 'active']);

    // Sales as saved before the history existed: written straight to the tables, timestamps in UTC.
    $this->oldSale = function (array $attributes, string $createdAt, ?string $updatedAt = null): Sale {
        $id = DB::table('sales')->insertGetId([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'date' => substr($createdAt, 0, 10),
            'subtotal' => $attributes['total'],
            'status' => 'completed',
            'payment_method' => 'cash',
            'installments' => 1,
            'created_at' => $createdAt,
            'updated_at' => $updatedAt ?? $createdAt,
            ...$attributes,
        ]);

        return Sale::query()->findOrFail($id);
    };
    $this->oldReceivable = function (Sale $sale, ?int $installment, float $amount, float $paid, string $status, ?string $receivedAt): void {
        DB::table('account_receivables')->insert([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'sale_id' => $sale->id,
            'installment_number' => $installment,
            'entry_date' => $sale->date->toDateString(),
            'due_date' => $sale->date->toDateString(),
            'amount' => $amount,
            'amount_paid' => $paid,
            'status' => $status,
            'received_at' => $receivedAt,
            'created_at' => $sale->created_at,
            'updated_at' => $sale->created_at,
        ]);
    };

    $this->runBackfill = function (): void {
        (require database_path('migrations/2026_11_05_231300_backfill_sale_history.php'))->up();
    };
});

function backfilledLines(Sale $sale): array
{
    return SaleEvent::query()
        ->where('sale_id', $sale->id)
        ->orderBy('occurred_at')
        ->orderBy('id')
        ->get()
        ->map(fn (SaleEvent $event): string => implode(' | ', [
            $event->type,
            $event->description,
            $event->amount ?? 'null',
            $event->occurred_at->setTimezone('America/Manaus')->format('Y-m-d H:i'),
        ]))
        ->all();
}

test('a completed counter sale gets registered, one payment and completion', function () {
    // Card in 2 installments, both received when the sale was saved.
    $sale = ($this->oldSale)(['total' => 200, 'payment_method' => 'card_credit', 'installments' => 2], '2026-05-10 15:00:00');
    ($this->oldReceivable)($sale, 1, 100, 100, 'received', '2026-05-10 15:00:00');
    ($this->oldReceivable)($sale, 2, 100, 100, 'received', '2026-05-10 15:00:00');

    ($this->runBackfill)();

    expect(backfilledLines($sale))->toBe([
        'created | Venda registrada | 200.00 | 2026-05-10 11:00',
        'payment_received | Pagamento recebido | 200.00 | 2026-05-10 11:00',
        'completed | Venda concluída | 200.00 | 2026-05-10 11:00',
    ])->and($sale->refresh()->completed_at?->toDateTimeString())->toBe('2026-05-10 15:00:00')
        ->and($sale->cancelled_at)->toBeNull()
        ->and($sale->updated_at->toDateTimeString())->toBe('2026-05-10 15:00:00');
});

test('crediário payments become one event each, dated on the Manaus day they were received', function () {
    $sale = ($this->oldSale)(['total' => 300, 'payment_method' => 'crediario', 'installments' => 3, 'crediario_entry' => 60, 'status' => 'pending'], '2026-05-10 15:00:00');
    ($this->oldReceivable)($sale, null, 60, 60, 'received', '2026-05-10 15:00:00');
    // Settled from the receivables screen, which saved only the day.
    ($this->oldReceivable)($sale, 1, 80, 80, 'received', '2026-06-10 00:00:00');
    ($this->oldReceivable)($sale, 2, 80, 30, 'partial', '2026-07-10 00:00:00');
    ($this->oldReceivable)($sale, 3, 80, 0, 'pending', null);

    ($this->runBackfill)();

    expect(backfilledLines($sale))->toBe([
        'created | Venda registrada | 300.00 | 2026-05-10 11:00',
        'payment_received | Entrada recebida | 60.00 | 2026-05-10 11:00',
        'payment_received | Parcela 1 recebida | 80.00 | 2026-06-10 00:00',
        'payment_received | Pagamento parcial da parcela 2 recebido | 30.00 | 2026-07-10 00:00',
    ])->and($sale->refresh()->completed_at)->toBeNull();
});

test('a completed crediário sale is completed at its last payment', function () {
    $sale = ($this->oldSale)(['total' => 160, 'payment_method' => 'crediario', 'installments' => 1, 'crediario_entry' => 60], '2026-05-10 15:00:00', '2026-08-01 12:00:00');
    ($this->oldReceivable)($sale, null, 60, 60, 'received', '2026-05-10 15:00:00');
    ($this->oldReceivable)($sale, 1, 100, 100, 'received', '2026-06-10 00:00:00');

    ($this->runBackfill)();

    expect(backfilledLines($sale))->toBe([
        'created | Venda registrada | 160.00 | 2026-05-10 11:00',
        'payment_received | Entrada recebida | 60.00 | 2026-05-10 11:00',
        'payment_received | Parcela 1 recebida | 100.00 | 2026-06-10 00:00',
        'completed | Venda concluída | 160.00 | 2026-06-10 00:00',
    ])->and($sale->refresh()->completed_at?->toDateTimeString())->toBe('2026-06-10 04:00:00');
});

test('a cancelled sale is cancelled at its last change and cancelled receivables are not payments', function () {
    $sale = ($this->oldSale)(['total' => 90, 'status' => 'cancelled'], '2026-05-10 15:00:00', '2026-05-12 13:00:00');
    ($this->oldReceivable)($sale, 1, 90, 90, 'cancelled', '2026-05-10 15:00:00');

    ($this->runBackfill)();

    expect(backfilledLines($sale))->toBe([
        'created | Venda registrada | 90.00 | 2026-05-10 11:00',
        'cancelled | Venda cancelada | 90.00 | 2026-05-12 09:00',
    ])->and($sale->refresh()->cancelled_at?->toDateTimeString())->toBe('2026-05-12 13:00:00')
        ->and($sale->completed_at)->toBeNull();
});

test('a completed sale without receivables is completed at its last change', function () {
    $sale = ($this->oldSale)(['total' => 50, 'payment_method' => 'pix'], '2026-05-10 15:00:00', '2026-05-11 15:00:00');

    ($this->runBackfill)();

    expect(backfilledLines($sale))->toBe([
        'created | Venda registrada | 50.00 | 2026-05-10 11:00',
        'completed | Venda concluída | 50.00 | 2026-05-11 11:00',
    ]);
});

test('a payment dated before the sale was saved is shown at the sale creation', function () {
    $sale = ($this->oldSale)(['total' => 100, 'status' => 'pending', 'payment_method' => 'card_credit', 'installments' => 2], '2026-05-10 15:00:00');
    ($this->oldReceivable)($sale, 1, 50, 50, 'received', '2026-05-01 00:00:00');
    ($this->oldReceivable)($sale, 2, 50, 0, 'pending', null);

    ($this->runBackfill)();

    expect(backfilledLines($sale)[1])->toBe('payment_received | Parcela 1 recebida | 50.00 | 2026-05-10 11:00');
});

test('running the backfill again changes nothing and sales that already have history are left alone', function () {
    $this->travelTo(Carbon::parse('2026-11-05 18:00:00'));

    $old = ($this->oldSale)(['total' => 100], '2026-05-10 15:00:00');
    ($this->oldReceivable)($old, 1, 100, 100, 'received', '2026-05-10 15:00:00');

    $newSaleId = $this->actingAs($this->user)->postJson('/api/sales', [
        'date' => '2026-11-05',
        'payment_method' => 'cash',
        'status' => 'pending',
        'items' => [[
            'product_id' => Product::query()->create([
                'company_id' => $this->company->id,
                'category_id' => Category::query()->create(['company_id' => $this->company->id, 'name' => 'Categoria', 'status' => 'active'])->id,
                'brand_id' => Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active'])->id,
                'name' => 'Produto',
                'sku' => 'P-BF',
                'sale_price' => 10,
                'cost' => 5,
                'stock' => 10,
                'status' => 'active',
            ])->id,
            'quantity' => 1,
            'unit_price' => 10,
        ]],
    ])->assertCreated()->json('data.id');

    ($this->runBackfill)();
    $afterFirstRun = SaleEvent::query()->orderBy('id')->get()->toArray();
    ($this->runBackfill)();

    expect(SaleEvent::query()->orderBy('id')->get()->toArray())->toBe($afterFirstRun)
        ->and(SaleEvent::query()->where('sale_id', $old->id)->count())->toBe(3)
        ->and(SaleEvent::query()->where('sale_id', $newSaleId)->pluck('description')->all())->toBe(['Venda registrada'])
        ->and(AccountReceivable::query()->where('sale_id', $old->id)->value('status'))->toBe('received');
});
