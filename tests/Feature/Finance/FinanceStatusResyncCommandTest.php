<?php

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\User;

test('finance resync command aligns receivables and payables status with sales and purchases', function () {
    $user = User::factory()->create();

    $company = Company::query()->create([
        'name' => 'Empresa Sync',
        'document_type' => 'cnpj',
        'document' => '90000000000001',
        'address' => 'Rua Sync',
        'phone' => '92999999999',
        'email' => 'sync@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);

    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);

    $sale = Sale::query()->create([
        'company_id' => $company->id,
        'customer_id' => null,
        'date' => now()->toDateString(),
        'subtotal' => 100,
        'total' => 100,
        'status' => 'completed',
        'payment_method' => 'pix',
        'installments' => 1,
        'first_installment_date' => now()->toDateString(),
    ]);

    $receivable = AccountReceivable::query()->create([
        'company_id' => $company->id,
        'customer_id' => null,
        'sale_id' => $sale->id,
        'installment_number' => 1,
        'entry_date' => now()->toDateString(),
        'due_date' => now()->toDateString(),
        'item' => 'Venda teste',
        'description' => null,
        'amount' => 100,
        'status' => 'pending',
        'received_at' => null,
    ]);

    $purchase = Purchase::query()->create([
        'company_id' => $company->id,
        'supplier_id' => null,
        'date' => now()->toDateString(),
        'due_date' => now()->toDateString(),
        'total' => 80,
        'status' => 'pending',
        'payment_method' => 'pix',
        'boleto_term_days' => null,
    ]);

    $payable = AccountPayable::query()->create([
        'company_id' => $company->id,
        'purchase_id' => $purchase->id,
        'installment_number' => 1,
        'due_date' => now()->toDateString(),
        'amount' => 80,
        'status' => 'paid',
        'paid_at' => now(),
        'paid_method' => 'pix',
    ]);

    $this->artisan('finance:resync-status', ['--company_id' => (string) $company->id])
        ->assertExitCode(0);

    expect($receivable->fresh()->status)->toBe('received')
        ->and($receivable->fresh()->received_at)->not->toBeNull()
        ->and($payable->fresh()->status)->toBe('pending')
        ->and($payable->fresh()->paid_at)->toBeNull()
        ->and($payable->fresh()->paid_method)->toBeNull();
});
