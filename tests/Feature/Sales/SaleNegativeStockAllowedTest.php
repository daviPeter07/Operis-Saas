<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('completed sale blocks negative stock by default', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S2',
        'document_type' => 'cnpj',
        'document' => '20000000000002',
        'address' => 'Rua 2',
        'phone' => '92999999999',
        'email' => 's2@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);
    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat', 'status' => 'active']);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-S2',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 1,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_price' => 10,
        ]],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['stock']);

    expect($product->fresh()->stock)->toBe('1.00');
});

test('completed sale allows negative stock with override flag', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S2B',
        'document_type' => 'cnpj',
        'document' => '20000000000012',
        'address' => 'Rua 12',
        'phone' => '92999999999',
        'email' => 's2b@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);
    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat', 'status' => 'active']);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-S2B',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 1,
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'allow_negative_stock' => true,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_price' => 10,
        ]],
    ])->assertCreated();

    expect($product->fresh()->stock)->toBe('-4.00');
});
