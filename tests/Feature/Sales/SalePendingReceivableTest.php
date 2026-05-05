<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('pending sale creates receivable without decreasing stock', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S2',
        'document_type' => 'cnpj',
        'document' => '20000000000002',
        'address' => 'Rua 2',
        'phone' => '92999999998',
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
        'stock' => 10,
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'pending',
        'payment_method' => 'installment',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_price' => 10,
        ]],
    ])->assertCreated();

    expect($product->fresh()->stock)->toBe('10.00');
    $this->assertDatabaseCount('stock_movements', 0);
    $this->assertDatabaseCount('account_receivables', 1);
});
