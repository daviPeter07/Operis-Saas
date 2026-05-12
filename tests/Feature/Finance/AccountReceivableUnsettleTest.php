<?php

use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

test('account receivable can be unsettled and reopen pending sale', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa R6',
        'document_type' => 'cnpj',
        'document' => '40000000000006',
        'address' => 'Rua 6',
        'phone' => '92999999999',
        'email' => 'r6@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    $customer = Customer::query()->create([
        'company_id' => $company->id,
        'name' => 'Cliente Teste',
        'status' => 'active',
        'credit_enabled' => true,
        'credit_limit' => 1000,
        'credit_term_days' => 30,
    ]);

    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => 'Marca', 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => 'Cat', 'status' => 'active']);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-R6',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $saleId = $this->actingAs($user)->postJson('/operis/api/sales', [
        'customer_id' => $customer->id,
        'date' => now()->toDateString(),
        'payment_method' => 'crediario',
        'crediario_entry' => 5,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10,
        ]],
    ])->json('data.id');

    $receivable = AccountReceivable::query()
        ->where('sale_id', $saleId)
        ->where('status', 'pending')
        ->firstOrFail();

    $this->actingAs($user)->postJson("/operis/api/account-receivables/{$receivable->id}/settle", [
        'received_at' => now()->toDateString(),
    ])->assertOk();

    $this->actingAs($user)->postJson("/operis/api/account-receivables/{$receivable->id}/unsettle")
        ->assertOk();

    expect($receivable->fresh()->status)->toBe('pending')
        ->and(Sale::query()->findOrFail($saleId)->status)->toBe('pending');
});
