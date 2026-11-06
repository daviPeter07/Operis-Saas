<?php

use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Em Aberto',
        'document_type' => 'cnpj',
        'document' => '95000000000001',
        'address' => 'Rua Aberto',
        'phone' => '92999999999',
        'email' => 'aberto@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $this->user->id, 'role' => 'owner', 'status' => 'active']);
    $this->user->update(['current_company_id' => $company->id]);

    $customer = Customer::query()->create(['company_id' => $company->id, 'name' => 'Cliente', 'status' => 'active']);
    $this->sale = Sale::query()->create([
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'date' => '2026-11-01',
        'total' => 330,
        'crediario_entry' => 50,
        'status' => 'pending',
        'payment_method' => 'crediario',
    ]);

    $receivable = fn (array $attributes) => AccountReceivable::query()->create([
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'sale_id' => $this->sale->id,
        'entry_date' => '2026-11-01',
        'due_date' => '2026-12-01',
        'amount_paid' => 0,
        'status' => 'pending',
        ...$attributes,
    ]);
    $receivable(['installment_number' => null, 'amount' => 50, 'amount_paid' => 50, 'status' => 'received']);
    $receivable(['installment_number' => 1, 'amount' => 100, 'amount_paid' => 100, 'status' => 'received']);
    $receivable(['installment_number' => 2, 'amount' => 100, 'amount_paid' => 40, 'status' => 'partial']);
    $receivable(['installment_number' => 3, 'amount' => 50]);
    $receivable(['installment_number' => 4, 'amount' => 30, 'status' => 'cancelled']);
});

test('a sale reports only what is still to be received', function () {
    // 60 left on installment 2 plus 50 on installment 3; entry, paid and cancelled are out.
    $this->actingAs($this->user)->getJson('/api/sales')
        ->assertOk()
        ->assertJsonPath('data.0.open_amount', 110);

    $this->actingAs($this->user)->getJson("/api/sales/{$this->sale->id}")
        ->assertOk()
        ->assertJsonPath('data.open_amount', 110);
});
