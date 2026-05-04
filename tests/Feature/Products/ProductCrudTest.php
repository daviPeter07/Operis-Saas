<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;

test('product crud cycle works', function () {
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

    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca X', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat X', 'status' => 'active']);

    $create = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Produto 1',
        'sku' => 'SKU-1',
        'sale_price' => 100,
        'cost' => 60,
        'stock' => 10,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
    ]);
    $create->assertCreated();
    $id = $create->json('data.id');

    $this->actingAs($user)->getJson('/api/products')->assertOk();
    $this->actingAs($user)->putJson("/api/products/{$id}", [
        'name' => 'Produto 2',
        'sku' => 'SKU-1',
        'sale_price' => 120,
        'cost' => 70,
        'stock' => 8,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
    ])->assertOk();
    $this->actingAs($user)->deleteJson("/api/products/{$id}")->assertNoContent();
});
