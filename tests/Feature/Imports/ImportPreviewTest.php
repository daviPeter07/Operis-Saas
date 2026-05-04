<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('import preview returns valid and invalid rows', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa I1',
        'document_type' => 'cnpj',
        'document' => '40000000000001',
        'address' => 'Rua 1',
        'phone' => '92999999999',
        'email' => 'i1@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    $csv = "name,email\nCliente A,a@test.com\n,b@test.com\n";
    $file = UploadedFile::fake()->createWithContent('customers.csv', $csv);

    $response = $this->actingAs($user)->post('/api/customers/import', ['file' => $file]);
    $response->assertOk();
    expect($response->json('data.valid_rows'))->toHaveCount(1);
    expect($response->json('data.invalid_rows'))->toHaveCount(1);
});
