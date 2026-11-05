<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;

test('brand and category crud cycle works', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa C',
        'document_type' => 'cnpj',
        'document' => '10000000000003',
        'address' => 'Rua C',
        'phone' => '92999999999',
        'email' => 'c@test.com',
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

    $brand = $this->actingAs($user)->postJson('/api/brands', ['name' => 'Marca A']);
    $brand->assertCreated();
    $brandId = $brand->json('data.id');

    $category = $this->actingAs($user)->postJson('/api/categories', ['name' => 'Cat A']);
    $category->assertCreated();
    $categoryId = $category->json('data.id');

    $this->actingAs($user)->getJson('/api/brands')->assertOk();
    $this->actingAs($user)->getJson('/api/categories')->assertOk();
    $this->actingAs($user)->putJson("/api/brands/{$brandId}", ['name' => 'Marca B'])->assertOk();
    $this->actingAs($user)->putJson("/api/categories/{$categoryId}", ['name' => 'Cat B'])->assertOk();
    $this->actingAs($user)->deleteJson("/api/brands/{$brandId}")->assertNoContent();
    $this->actingAs($user)->deleteJson("/api/categories/{$categoryId}")->assertNoContent();
});

test('brands and categories expose their registration date for the period filter', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa D',
        'document_type' => 'cnpj',
        'document' => '10000000000004',
        'address' => 'Rua D',
        'phone' => '92999999999',
        'email' => 'd@test.com',
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

    $this->actingAs($user)->postJson('/api/brands', ['name' => 'Marca Datada'])->assertCreated();
    $this->actingAs($user)->postJson('/api/categories', ['name' => 'Categoria Datada'])->assertCreated();

    $dateFormat = '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/';

    expect($this->actingAs($user)->getJson('/api/brands')->assertOk()->json('data.0.createdAt'))
        ->toMatch($dateFormat)
        ->and($this->actingAs($user)->getJson('/api/categories')->assertOk()->json('data.0.createdAt'))
        ->toMatch($dateFormat);
});
