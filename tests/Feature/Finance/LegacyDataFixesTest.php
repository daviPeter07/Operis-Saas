<?php

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->company = Company::query()->create([
        'name' => 'Empresa Legado',
        'document_type' => 'cnpj',
        'document' => '93000000000001',
        'address' => 'Rua Legado',
        'phone' => '92999999999',
        'email' => 'legado@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    $this->customer = Customer::query()->create(['company_id' => $this->company->id, 'name' => 'Cliente', 'status' => 'active']);

    $this->sale = fn (string $status): Sale => Sale::query()->create([
        'company_id' => $this->company->id,
        'customer_id' => $this->customer->id,
        'date' => '2026-05-14',
        'total' => 300,
        'status' => $status,
        'payment_method' => 'crediario',
    ]);

    $this->receivable = fn (?Sale $sale, array $attributes): AccountReceivable => AccountReceivable::query()->create([
        'company_id' => $this->company->id,
        'customer_id' => $this->customer->id,
        'sale_id' => $sale?->id,
        'entry_date' => '2026-05-14',
        'due_date' => '2026-06-14',
        'amount' => 100,
        'amount_paid' => 0,
        'status' => 'pending',
        ...$attributes,
    ]);

    $this->run = function (): void {
        (require database_path('migrations/2026_11_05_231250_backfill_amount_paid_of_settled_accounts.php'))->up();
        (require database_path('migrations/2026_11_05_231260_complete_fully_received_sales.php'))->up();
    };
});

test('settled accounts saved before amount_paid existed get their full amount as paid', function () {
    $legacy = ($this->receivable)(null, ['status' => 'received', 'received_at' => '2026-05-14']);
    $partial = ($this->receivable)(null, ['status' => 'partial', 'amount_paid' => 40]);
    $open = ($this->receivable)(null, []);
    $supplier = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Fornecedor', 'status' => 'active']);
    $payable = AccountPayable::query()->create([
        'company_id' => $this->company->id,
        'supplier_id' => $supplier->id,
        'entry_date' => '2026-05-14',
        'due_date' => '2026-05-14',
        'amount' => 80,
        'amount_paid' => 0,
        'status' => 'paid',
    ]);

    ($this->run)();
    ($this->run)();

    expect($legacy->fresh()->amount_paid)->toBe('100.00')
        ->and($partial->fresh()->amount_paid)->toBe('40.00')
        ->and($open->fresh()->amount_paid)->toBe('0.00')
        ->and($payable->fresh()->amount_paid)->toBe('80.00');
});

test('pending sales with every receivable received or cancelled become completed', function () {
    $paid = ($this->sale)('pending');
    ($this->receivable)($paid, ['status' => 'received', 'amount_paid' => 100]);
    ($this->receivable)($paid, ['status' => 'cancelled']);

    $open = ($this->sale)('pending');
    ($this->receivable)($open, ['status' => 'received', 'amount_paid' => 100]);
    ($this->receivable)($open, ['status' => 'partial', 'amount_paid' => 10]);

    $withoutReceivables = ($this->sale)('pending');
    $cancelled = ($this->sale)('cancelled');
    ($this->receivable)($cancelled, ['status' => 'cancelled']);

    ($this->run)();

    expect($paid->fresh()->status)->toBe('completed')
        ->and($open->fresh()->status)->toBe('pending')
        ->and($withoutReceivables->fresh()->status)->toBe('pending')
        ->and($cancelled->fresh()->status)->toBe('cancelled');
});

test('the sale history backfill then records the payments and the completion', function () {
    $sale = ($this->sale)('pending');
    ($this->receivable)($sale, ['status' => 'received', 'installment_number' => 1, 'amount' => 300, 'received_at' => '2026-05-14 15:00:00']);

    ($this->run)();
    DB::table('sale_events')->where('sale_id', $sale->id)->delete();
    (require database_path('migrations/2026_11_05_231300_backfill_sale_history.php'))->up();

    expect(DB::table('sale_events')->where('sale_id', $sale->id)->orderBy('occurred_at')->orderBy('id')->pluck('description')->all())
        ->toBe(['Venda registrada', 'Parcela 1 recebida', 'Venda concluída'])
        ->and($sale->fresh()->completed_at)->not->toBeNull();
});
