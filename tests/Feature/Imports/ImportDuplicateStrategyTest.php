<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;

test('import duplicate strategy ignore or update works', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa I3',
        'document_type' => 'cnpj',
        'document' => '40000000000003',
        'address' => 'Rua 3',
        'phone' => '92999999999',
        'email' => 'i3@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    Customer::query()->create(['company_id' => $company->id, 'name' => 'Base', 'email' => 'dup@test.com', 'status' => 'active']);

    $row = [['name' => 'Novo Nome', 'email' => 'dup@test.com']];
    $this->actingAs($user)->postJson('/api/customers/import', ['rows' => $row, 'strategy' => 'ignore'])->assertOk();
    expect(Customer::query()->where('company_id', $company->id)->count())->toBe(1);

    $this->actingAs($user)->postJson('/api/customers/import', ['rows' => $row, 'strategy' => 'update'])->assertOk();
    expect(Customer::query()->where('company_id', $company->id)->first()->name)->toBe('Novo Nome');
});
