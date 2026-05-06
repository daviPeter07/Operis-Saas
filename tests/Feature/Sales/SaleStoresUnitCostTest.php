<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('sale items persist the current product cost', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Custo',
        'document_type' => 'cnpj',
        'document' => '50000000000003',
        'address' => 'Rua Custo',
        'phone' => '92999999993',
        'email' => 'custo@test.com',
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
    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Marca',
        'status' => 'active',
    ]);
    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Cat',
        'status' => 'active',
    ]);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-COST',
        'sale_price' => 25,
        'cost' => 11.5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 25,
        ]],
    ])->assertCreated();

    $saleId = $response->json('data.id');

    $this->assertDatabaseHas('sale_items', [
        'sale_id' => $saleId,
        'product_id' => $product->id,
        'unit_cost' => 11.5,
    ]);

    $this->actingAs($user)->getJson('/api/sales')
        ->assertOk()
        ->assertJsonPath('data.0.items.0.product_name', 'Produto')
        ->assertJsonPath('data.0.items.0.category_name', 'Cat');
});
