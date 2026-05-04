<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('completed purchase increases stock and creates payable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa P1',
        'document_type' => 'cnpj',
        'document' => '30000000000001',
        'address' => 'Rua 1',
        'phone' => '92999999999',
        'email' => 'p1@test.com',
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
        'sku' => 'P-P1',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 2,
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_cost' => 4,
        ]],
    ])->assertCreated();

    expect($product->fresh()->stock)->toBe('7.00');
    $this->assertDatabaseCount('stock_movements', 1);
    $this->assertDatabaseCount('account_payables', 1);
});
