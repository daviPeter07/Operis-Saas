<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

test('cancelling completed sale restores stock and cancels receivable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa S4',
        'document_type' => 'cnpj',
        'document' => '20000000000004',
        'address' => 'Rua 4',
        'phone' => '92999999999',
        'email' => 's4@test.com',
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
        'sku' => 'P-S4',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $created = $this->actingAs($user)->postJson('/api/sales', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10,
        ]],
    ]);

    $saleId = $created->json('data.id');
    $this->actingAs($user)->postJson("/api/sales/{$saleId}/cancel")->assertNoContent();

    expect($product->fresh()->stock)->toBe('10.00');
    expect(Sale::query()->find($saleId)->status)->toBe('cancelled');
    expect(AccountReceivable::query()->where('sale_id', $saleId)->first()?->status)->toBe('cancelled');
});
