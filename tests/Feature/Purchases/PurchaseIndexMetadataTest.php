<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns product metadata for purchase items in the index', function (): void {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Metadata',
        'document_type' => 'cnpj',
        'document' => '30000000000011',
        'address' => 'Rua Metadata',
        'phone' => '92999999998',
        'email' => 'metadata@test.com',
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

    $category = Category::query()->create([
        'company_id' => $company->id,
        'name' => 'Eletronicos',
        'status' => 'active',
    ]);

    $brand = Brand::query()->create([
        'company_id' => $company->id,
        'name' => 'Acme',
        'status' => 'active',
    ]);

    $supplier = Supplier::query()->create([
        'company_id' => $company->id,
        'name' => 'Fornecedor XPTO',
        'status' => 'active',
    ]);

    $product = Product::query()->create([
        'company_id' => $company->id,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => 'Monitor 24',
        'sku' => 'MON-24',
        'sale_price' => 1200,
        'cost' => 800,
        'stock' => 10,
        'min_stock' => 2,
        'status' => 'active',
    ]);

    $purchase = Purchase::query()->create([
        'company_id' => $company->id,
        'supplier_id' => $supplier->id,
        'date' => '2026-05-05',
        'due_date' => '2026-05-10',
        'total' => 1600,
        'status' => 'pending',
        'payment_method' => 'pix',
    ]);

    PurchaseItem::query()->create([
        'company_id' => $company->id,
        'purchase_id' => $purchase->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_cost' => 800,
        'subtotal' => 1600,
    ]);

    $response = $this->actingAs($user)->getJson('/api/purchases');

    $response
        ->assertOk()
        ->assertJsonPath('data.0.items.0.product_name', 'Monitor 24')
        ->assertJsonPath('data.0.items.0.category_name', 'Eletronicos')
        ->assertJsonPath('data.0.items.0.brand_name', 'Acme');
});
