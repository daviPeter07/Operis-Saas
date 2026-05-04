<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\CompanyVerificationCode;
use App\Models\User;

test('authenticated user can create company in onboarding flow', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->postJson('/api/onboarding/company', [
            'name' => 'Operis LTDA',
            'document' => '12.345.678/0001-90',
            'address' => 'Rua das Flores, 100',
            'phone' => '92999999999',
            'email' => 'contato@operis.test',
            'city' => 'Manaus',
            'state' => 'AM',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Operis LTDA')
        ->assertJsonPath('data.document_type', 'cnpj');

    $company = Company::query()->first();

    expect($company)->not->toBeNull();
    expect($user->fresh()->current_company_id)->toBe($company->id);

    expect(CompanyUser::query()
        ->where('company_id', $company->id)
        ->where('user_id', $user->id)
        ->exists())->toBeTrue();

    expect(CompanyVerificationCode::query()
        ->where('company_id', $company->id)
        ->where('user_id', $user->id)
        ->exists())->toBeTrue();
});
