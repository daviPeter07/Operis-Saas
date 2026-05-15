<?php

use App\Models\AccountPayable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;

test('pending purchase with boleto creates payable with boleto due date', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Boleto',
        'document_type' => 'cnpj',
        'document' => '50000000000004',
        'address' => 'Rua Boleto',
        'phone' => '92999999994',
        'email' => 'boleto@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $user->update(['current_company_id' => $company->id]);
    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Marca',
        'status' => 'active',
    ]);
    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Cat',
        'status' => 'active',
    ]);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto',
        'sku' => 'P-BOLETO',
        'sale_price' => 25,
        'cost' => 11.5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/purchases', [
        'date' => '2026-05-06',
        'status' => 'pending',
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_cost' => 10,
        ]],
    ])->assertCreated();

    $purchaseId = $response->json('data.id');
    $expectedDueDate = Carbon::parse('2026-05-06')->addDays(60)->toDateString();

    $this->assertDatabaseHas('purchases', [
        'id' => $purchaseId,
        'payment_method' => 'boleto',
        'boleto_term_days' => 60,
        'due_date' => "{$expectedDueDate} 00:00:00",
    ]);

    $payables = AccountPayable::query()
        ->where('purchase_id', $purchaseId)
        ->orderBy('installment_number')
        ->get();

    expect($payables)->toHaveCount(2)
        ->and($payables[0]->installment_number)->toBe(1)
        ->and($payables[0]->due_date?->toDateString())
        ->toBe(Carbon::parse('2026-05-06')->addDays(30)->toDateString())
        ->and($payables[0]->amount)->toBe('15.00')
        ->and($payables[1]->installment_number)->toBe(2)
        ->and($payables[1]->due_date?->toDateString())
        ->toBe(Carbon::parse('2026-05-06')->addDays(60)->toDateString())
        ->and($payables[1]->amount)->toBe('15.00');
});

test('pending purchase with boleto 150 days creates 5 installments', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Boleto 150',
        'document_type' => 'cnpj',
        'document' => '50000000000044',
        'address' => 'Rua Boleto 150',
        'phone' => '92999999944',
        'email' => 'boleto150@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $company->id,
        'user_id' => $user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $user->update(['current_company_id' => $company->id]);
    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Marca 150',
        'status' => 'active',
    ]);
    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Cat 150',
        'status' => 'active',
    ]);
    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Produto 150',
        'sku' => 'P-BOLETO-150',
        'sale_price' => 25,
        'cost' => 11.5,
        'stock' => 10,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->postJson('/api/purchases', [
        'date' => '2026-05-06',
        'status' => 'pending',
        'payment_method' => 'boleto',
        'boleto_term_days' => 150,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 5,
            'unit_cost' => 10,
        ]],
    ])->assertCreated();

    $purchaseId = $response->json('data.id');

    $payables = AccountPayable::query()
        ->where('purchase_id', $purchaseId)
        ->orderBy('installment_number')
        ->get();

    expect($payables)->toHaveCount(5)
        ->and($payables->every(fn (AccountPayable $payable) => $payable->total_installments === 5))->toBeTrue();
});
