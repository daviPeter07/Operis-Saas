<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\CompanyVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can verify company with a valid code', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Operis LTDA',
        'document_type' => 'cnpj',
        'document' => '12345678000190',
        'address' => 'Rua A, 1',
        'phone' => '92999999999',
        'email' => 'contato@operis.test',
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

    CompanyVerificationCode::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'code_hash' => Hash::make('123456'),
        'expires_at' => now()->addMinutes(10),
        'sent_at' => now()->subSeconds(70),
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson('/api/onboarding/verify-code', [
            'code' => '123456',
        ]);

    $response->assertOk();
    expect($user->fresh()->email_verified_at)->not->toBeNull();
    expect($company->fresh()->verified_at)->not->toBeNull();
});

test('verification fails when code is expired', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Operis LTDA',
        'document_type' => 'cnpj',
        'document' => '12345678000191',
        'address' => 'Rua A, 1',
        'phone' => '92999999999',
        'email' => 'contato2@operis.test',
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

    CompanyVerificationCode::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'code_hash' => Hash::make('654321'),
        'expires_at' => now()->subMinute(),
        'sent_at' => now()->subMinutes(2),
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson('/api/onboarding/verify-code', [
            'code' => '654321',
        ]);

    $response->assertUnprocessable()
        ->assertJsonPath('errors.code.0', 'Codigo expirado.');
});
