<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('brand and category are hard deleted', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa E',
        'document_type' => 'cnpj',
        'document' => '10000000000005',
        'address' => 'Rua E',
        'phone' => '92999999999',
        'email' => 'e@test.com',
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

    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca Y', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat Y', 'status' => 'active']);

    $this->actingAs($user)->deleteJson("/api/brands/{$brand->id}")->assertNoContent();
    $this->actingAs($user)->deleteJson("/api/categories/{$category->id}")->assertNoContent();

    expect(Brand::query()->find($brand->id))->toBeNull();
    expect(Category::query()->find($category->id))->toBeNull();
});

test('product is hard deleted', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa F',
        'document_type' => 'cnpj',
        'document' => '10000000000006',
        'address' => 'Rua F',
        'phone' => '92999999999',
        'email' => 'f@test.com',
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

    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca Z', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat Z', 'status' => 'active']);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto Z',
        'sku' => 'SKU-Z',
        'sale_price' => 15,
        'cost' => 8,
        'stock' => 2,
        'status' => 'active',
    ]);

    $this->actingAs($user)->deleteJson("/api/products/{$product->id}")->assertNoContent();

    expect(Product::query()->find($product->id))->toBeNull();
});
