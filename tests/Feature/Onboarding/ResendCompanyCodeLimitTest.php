<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\CompanyVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('resend code enforces 1 minute cooldown', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Operis LTDA',
        'document_type' => 'cnpj',
        'document' => '12345678000192',
        'address' => 'Rua A, 1',
        'phone' => '92999999999',
        'email' => 'contato3@operis.test',
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
        'code_hash' => Hash::make('111111'),
        'expires_at' => now()->addMinutes(15),
        'sent_at' => now()->subSeconds(30),
    ]);

    $response = $this
        ->actingAs($user)
        ->postJson('/api/onboarding/resend-code');

    $response->assertUnprocessable()
        ->assertJsonPath('errors.code.0', 'Aguarde 1 minuto antes de reenviar o codigo.');
});

test('resend code enforces five attempts per hour', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Operis LTDA',
        'document_type' => 'cnpj',
        'document' => '12345678000193',
        'address' => 'Rua A, 1',
        'phone' => '92999999999',
        'email' => 'contato4@operis.test',
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

    foreach (range(1, 5) as $i) {
        CompanyVerificationCode::query()->create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'code_hash' => Hash::make((string) (100000 + $i)),
            'expires_at' => now()->addMinutes(15),
            'sent_at' => now()->subMinutes(10)->subSeconds($i + 60),
        ]);
    }

    $response = $this
        ->actingAs($user)
        ->postJson('/api/onboarding/resend-code');

    $response->assertUnprocessable()
        ->assertJsonPath('errors.code.0', 'Limite de 5 reenvios por hora atingido.');
});
