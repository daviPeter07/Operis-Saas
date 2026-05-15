<?php

use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;

test('account receivable supports partial settlement', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Parcial AR',
        'document_type' => 'cnpj',
        'document' => '40000000000123',
        'address' => 'Rua Parcial',
        'phone' => '92999999999',
        'email' => 'parcial-ar@test.com',
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
    $user->update(['current_company_id' => $company->id]);

    $customer = Customer::query()->create([
        'company_id' => $company->id,
        'name' => 'Cliente AR',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 1000,
        'credit_term_days' => 30,
    ]);

    $receivable = AccountReceivable::query()->create([
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'sale_id' => null,
        'installment_number' => null,
        'entry_date' => now()->toDateString(),
        'due_date' => now()->addDays(30)->toDateString(),
        'item' => 'Parcela manual',
        'description' => null,
        'amount' => 100,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)->postJson("/api/account-receivables/{$receivable->id}/partial-settle", [
        'amount' => 40,
        'received_at' => now()->toDateString(),
    ])->assertOk();

    expect($receivable->fresh()->status)->toBe('partial')
        ->and((float) $receivable->fresh()->amount_paid)->toBe(40.0);

    $this->actingAs($user)->postJson("/api/account-receivables/{$receivable->id}/partial-settle", [
        'amount' => 60,
        'received_at' => now()->toDateString(),
    ])->assertOk();

    expect($receivable->fresh()->status)->toBe('received')
        ->and((float) $receivable->fresh()->amount_paid)->toBe(100.0);
});
