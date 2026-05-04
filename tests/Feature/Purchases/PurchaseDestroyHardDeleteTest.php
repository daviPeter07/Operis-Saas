<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\User;

test('destroying completed purchase hard deletes purchase and restores stock', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa PD',
        'document_type' => 'cnpj',
        'document' => '30000000000013',
        'address' => 'Rua PD',
        'phone' => '92999999999',
        'email' => 'pd@test.com',
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
        'sku' => 'P-PD',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 2,
        'status' => 'active',
    ]);

    $created = $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_cost' => 4,
        ]],
    ]);
    $purchaseId = $created->json('data.id');
    $this->actingAs($user)->deleteJson("/api/purchases/{$purchaseId}")->assertNoContent();

    expect($product->fresh()->stock)->toBe('2.00');
    expect(Purchase::query()->find($purchaseId))->toBeNull();
    expect(PurchaseItem::query()->where('purchase_id', $purchaseId)->exists())->toBeFalse();
    expect(AccountPayable::query()->where('purchase_id', $purchaseId)->exists())->toBeFalse();
});
