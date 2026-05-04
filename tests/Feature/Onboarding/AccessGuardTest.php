<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;

test('blocks access when user has no current company', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->getJson('/api/context/ping');

    $response->assertForbidden()
        ->assertJsonPath('message', 'User has no selected company.');
});

test('blocks access when company is not verified', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Teste',
        'document_type' => 'cnpj',
        'document' => '00000000000199',
        'address' => 'Rua A, 100',
        'phone' => '92999999999',
        'email' => 'contato@empresa.test',
        'city' => 'Manaus',
        'state' => 'AM',
    ]);

    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);

    $user->update(['current_company_id' => $company->id]);

    $response = $this
        ->actingAs($user)
        ->getJson('/api/context/ping');

    $response->assertForbidden()
        ->assertJsonPath('message', 'Current company is not verified.');
});
