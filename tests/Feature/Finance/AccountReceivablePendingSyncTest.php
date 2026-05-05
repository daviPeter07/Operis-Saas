<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

test('account receivables index backfills missing pending sale receivable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa F1',
        'document_type' => 'cnpj',
        'document' => '40000000000001',
        'address' => 'Rua 1',
        'phone' => '92999999999',
        'email' => 'f1@test.com',
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
        'sku' => 'P-F1',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $sale = Sale::query()->create([
        'company_id' => $company->id,
        'date' => now()->toDateString(),
        'subtotal' => 30,
        'total' => 30,
        'status' => 'pending',
        'payment_method' => 'installment',
        'installments' => 1,
        'first_installment_date' => now()->toDateString(),
    ]);

    $sale->items()->create([
        'company_id' => $company->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'unit_price' => 10,
        'subtotal' => 30,
    ]);

    $this->assertDatabaseCount('account_receivables', 0);

    $this->actingAs($user)->getJson('/api/account-receivables')
        ->assertOk()
        ->assertJsonPath('data.0.sale_id', $sale->id)
        ->assertJsonPath('data.0.status', 'pending');

    $this->assertDatabaseCount('account_receivables', 1);
});
