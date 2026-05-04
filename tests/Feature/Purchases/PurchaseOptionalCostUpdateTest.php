<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('purchase optionally updates product cost', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa P2',
        'document_type' => 'cnpj',
        'document' => '30000000000002',
        'address' => 'Rua 2',
        'phone' => '92999999999',
        'email' => 'p2@test.com',
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
        'sku' => 'P-P2',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 1,
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'update_product_cost' => false,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_cost' => 9,
        ]],
    ])->assertCreated();
    expect($product->fresh()->cost)->toBe('5.00');

    $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'update_product_cost' => true,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_cost' => 11,
        ]],
    ])->assertCreated();
    expect($product->fresh()->cost)->toBe('11.00');
});
