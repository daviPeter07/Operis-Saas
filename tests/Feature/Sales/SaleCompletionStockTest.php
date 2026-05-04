<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('completed sale decreases stock and creates receivable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S1',
        'document_type' => 'cnpj',
        'document' => '20000000000001',
        'address' => 'Rua 1',
        'phone' => '92999999999',
        'email' => 's1@test.com',
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
        'sku' => 'P-S1',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_price' => 10,
        ]],
    ]);

    $response->assertCreated();
    expect($product->fresh()->stock)->toBe('7.00');
    $this->assertDatabaseCount('stock_movements', 1);
    $this->assertDatabaseCount('account_receivables', 1);
});
