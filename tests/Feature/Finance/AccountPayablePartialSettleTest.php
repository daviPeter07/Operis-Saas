<?php

use App\Models\AccountPayable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Supplier;
use App\Models\User;

test('account payable supports partial settlement', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Parcial AP',
        'document_type' => 'cnpj',
        'document' => '40000000000456',
        'address' => 'Rua Parcial AP',
        'phone' => '92999999999',
        'email' => 'parcial-ap@test.com',
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

    $supplier = Supplier::query()->create([
        'company_id' => $company->id,
        'name' => 'Fornecedor AP',
        'status' => 'active',
    ]);

    $payable = AccountPayable::query()->create([
        'company_id' => $company->id,
        'supplier_id' => $supplier->id,
        'purchase_id' => null,
        'installment_number' => 1,
        'entry_date' => now()->toDateString(),
        'item' => 'Conta manual',
        'description' => null,
        'due_date' => now()->addDays(30)->toDateString(),
        'amount' => 100,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)->postJson("/api/account-payables/{$payable->id}/partial-settle", [
        'amount' => 25,
        'paid_at' => now()->toDateString(),
        'paid_method' => 'pix',
    ])->assertOk();

    expect($payable->fresh()->status)->toBe('partial')
        ->and((float) $payable->fresh()->amount_paid)->toBe(25.0);

    $this->actingAs($user)->postJson("/api/account-payables/{$payable->id}/partial-settle", [
        'amount' => 75,
        'paid_at' => now()->toDateString(),
        'paid_method' => 'pix',
    ])->assertOk();

    expect($payable->fresh()->status)->toBe('paid')
        ->and((float) $payable->fresh()->amount_paid)->toBe(100.0);
});
