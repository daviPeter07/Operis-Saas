<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;

test('supplier crud cycle works', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa B',
        'document_type' => 'cnpj',
        'document' => '10000000000002',
        'address' => 'Rua B',
        'phone' => '92999999999',
        'email' => 'b@test.com',
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

    $create = $this->actingAs($user)->postJson('/api/suppliers', ['name' => 'Fornecedor 1']);
    $create->assertCreated();
    $id = $create->json('data.id');

    $this->actingAs($user)->getJson('/api/suppliers')->assertOk();
    $this->actingAs($user)->putJson("/api/suppliers/{$id}", ['name' => 'Fornecedor 2'])->assertOk();
    $this->actingAs($user)->deleteJson("/api/suppliers/{$id}")->assertNoContent();
});
