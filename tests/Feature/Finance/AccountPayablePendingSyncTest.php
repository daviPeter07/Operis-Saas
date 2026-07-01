<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\User;

test('account payables index backfills missing pending purchase payable', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa F2',
        'document_type' => 'cnpj',
        'document' => '40000000000002',
        'address' => 'Rua 2',
        'phone' => '92999999999',
        'email' => 'f2@test.com',
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
        'sku' => 'P-F2',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $purchase = Purchase::query()->create([
        'company_id' => $company->id,
        'date' => now()->toDateString(),
        'due_date' => now()->addDays(7)->toDateString(),
        'total' => 20,
        'status' => 'pending',
        'payment_method' => 'installment',
    ]);

    $purchase->items()->create([
        'company_id' => $company->id,
        'product_id' => $product->id,
        'quantity' => 5,
        'unit_cost' => 4,
        'subtotal' => 20,
    ]);

    $this->assertDatabaseCount('account_payables', 0);

    $this->actingAs($user)->getJson('/api/account-payables')
        ->assertOk()
        ->assertJsonPath('data.0.purchase_id', $purchase->id)
        ->assertJsonPath('data.0.total_amount', fn (mixed $value) => (float) $value === 20.0)
        ->assertJsonPath('data.0.amount', fn (mixed $value) => (float) $value === 20.0)
        ->assertJsonPath('data.0.remaining_balance', fn (mixed $value) => (float) $value === 20.0)
        ->assertJsonPath('data.0.amount_paid', fn (mixed $value) => (float) $value === 0.0)
        ->assertJsonPath('data.0.status', 'pending');

    $this->assertDatabaseCount('account_payables', 1);
});
