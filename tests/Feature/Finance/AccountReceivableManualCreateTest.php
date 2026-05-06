<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;

test('manual account receivable can be created without sale relation', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Manual',
        'document_type' => 'cnpj',
        'document' => '50000000000005',
        'address' => 'Rua Manual',
        'phone' => '92999999995',
        'email' => 'manual@test.com',
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
        'name' => 'Cliente Manual',
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Servico avulso',
        'description' => 'Lancamento manual',
        'amount' => 75.5,
        'entry_date' => '2026-05-06',
    ])->assertCreated();

    $this->assertDatabaseHas('account_receivables', [
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'sale_id' => null,
        'item' => 'Servico avulso',
        'description' => 'Lancamento manual',
        'amount' => 75.5,
        'entry_date' => '2026-05-06 00:00:00',
        'due_date' => null,
        'status' => 'pending',
    ]);
});
