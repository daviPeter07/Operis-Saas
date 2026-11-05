<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\User;

test('account payable can be unsettled and reopen pending purchase', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa P6',
        'document_type' => 'cnpj',
        'document' => '30000000000006',
        'address' => 'Rua 6',
        'phone' => '92999999999',
        'email' => 'p6@test.com',
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
        'sku' => 'P-P6',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 2,
        'status' => 'active',
    ]);

    $purchaseId = $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'pending',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_cost' => 4,
        ]],
    ])->json('data.id');

    $payable = AccountPayable::query()->where('purchase_id', $purchaseId)->firstOrFail();

    $this->actingAs($user)->postJson("/api/account-payables/{$payable->id}/settle", [
        'paid_at' => now()->toDateString(),
        'paid_method' => 'pix',
        'payment_notes' => 'Pago no prazo',
    ])->assertOk();

    $this->actingAs($user)->postJson("/api/account-payables/{$payable->id}/unsettle")
        ->assertOk();

    expect($payable->fresh()->status)->toBe('pending')
        ->and(Purchase::query()->findOrFail($purchaseId)->status)->toBe('pending')
        ->and((float) Product::query()->findOrFail($product->id)->stock)->toBe(4.0);
});
