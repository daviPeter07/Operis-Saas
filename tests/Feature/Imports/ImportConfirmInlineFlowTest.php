<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('import confirm persists valid rows in same flow', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa I2',
        'document_type' => 'cnpj',
        'document' => '40000000000002',
        'address' => 'Rua 2',
        'phone' => '92999999999',
        'email' => 'i2@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    $file = UploadedFile::fake()->createWithContent('customers.csv', "name,email\nCliente B,b@test.com\n");
    $preview = $this->actingAs($user)->post('/api/customers/import', ['file' => $file])->json('data.valid_rows');

    $this->actingAs($user)->postJson('/api/customers/import', [
        'rows' => $preview,
        'strategy' => 'ignore',
    ])->assertOk();

    expect(Customer::query()->where('company_id', $company->id)->count())->toBe(1);
});
