<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;

test('payables are generated and recalculated from purchase updates', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa P4',
        'document_type' => 'cnpj',
        'document' => '30000000000004',
        'address' => 'Rua 4',
        'phone' => '92999999999',
        'email' => 'p4@test.com',
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
        'sku' => 'P-P4',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 2,
        'status' => 'active',
    ]);

    $purchase = $this->actingAs($user)->postJson('/api/purchases', [
        'date' => now()->toDateString(),
        'status' => 'completed',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_cost' => 4,
        ]],
    ])->json('data.id');

    $firstPayable = AccountPayable::query()->where('purchase_id', $purchase)->first();
    expect($firstPayable->amount)->toBe('8.00')
        ->and($firstPayable->status)->toBe('paid');

    $this->actingAs($user)->putJson("/api/purchases/{$purchase}", [
        'date' => now()->toDateString(),
        'status' => 'pending',
        'payment_method' => 'pix',
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_cost' => 4,
        ]],
    ])->assertOk();

    $updatedPayable = AccountPayable::query()->where('purchase_id', $purchase)->first();
    expect($updatedPayable->amount)->toBe('20.00')
        ->and($updatedPayable->status)->toBe('pending');
});
