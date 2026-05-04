<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('receivables are generated and recalculated from sale updates', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S5',
        'document_type' => 'cnpj',
        'document' => '20000000000005',
        'address' => 'Rua 5',
        'phone' => '92999999999',
        'email' => 's5@test.com',
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
        'sku' => 'P-S5',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $sale = $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10,
        ]],
    ])->json('data.id');

    $firstAmount = AccountReceivable::query()->where('sale_id', $sale)->first()->amount;
    expect($firstAmount)->toBe('20.00');

    $this->actingAs($user)->putJson("/api/sales/{$sale}", [
        'date' => now()->toDateString(),
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 4,
            'unit_price' => 10,
        ]],
    ])->assertOk();

    $updatedAmount = AccountReceivable::query()->where('sale_id', $sale)->first()->amount;
    expect($updatedAmount)->toBe('40.00');
});
