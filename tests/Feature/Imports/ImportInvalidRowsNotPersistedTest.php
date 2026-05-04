<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('invalid preview rows are not persisted on confirm', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa I4',
        'document_type' => 'cnpj',
        'document' => '40000000000004',
        'address' => 'Rua 4',
        'phone' => '92999999999',
        'email' => 'i4@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    $file = UploadedFile::fake()->createWithContent('customers.csv', "name,email\n,invalid@test.com\n");
    $preview = $this->actingAs($user)->post('/api/customers/import', ['file' => $file])->json('data');
    expect($preview['valid_rows'])->toHaveCount(0);
    expect($preview['invalid_rows'])->toHaveCount(1);

    $this->actingAs($user)->postJson('/api/customers/import', [
        'rows' => $preview['valid_rows'],
        'strategy' => 'ignore',
    ])->assertStatus(422);

    expect(Customer::query()->where('company_id', $company->id)->count())->toBe(0);
});
