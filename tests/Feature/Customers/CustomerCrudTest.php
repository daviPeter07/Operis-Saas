<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;

test('customer crud cycle works', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa A',
        'document_type' => 'cnpj',
        'document' => '10000000000001',
        'address' => 'Rua A',
        'phone' => '92999999999',
        'email' => 'a@test.com',
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

    $create = $this->actingAs($user)->postJson('/api/customers', ['name' => 'Cliente 1']);
    $create->assertCreated();
    $id = $create->json('data.id');

    $this->actingAs($user)->getJson('/api/customers')->assertOk();
    $this->actingAs($user)->putJson("/api/customers/{$id}", ['name' => 'Cliente 2'])->assertOk();
    $this->actingAs($user)->deleteJson("/api/customers/{$id}")->assertNoContent();
});
