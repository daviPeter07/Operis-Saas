<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;

function recordIdFilterCompany(string $document): Company
{
    return Company::query()->create([
        'name' => "Empresa {$document}",
        'document_type' => 'cnpj',
        'document' => $document,
        'address' => 'Rua Filtro',
        'phone' => '92999999999',
        'email' => "{$document}@test.com",
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
}

/**
 * @return array{customer: Customer, supplier: Supplier, product: Product, sale: Sale, purchase: Purchase}
 */
function recordIdFilterRecords(Company $company): array
{
    $suffix = uniqid();
    $customer = Customer::query()->create(['company_id' => $company->id, 'name' => 'Cliente', 'status' => 'active']);
    $supplier = Supplier::query()->create(['company_id' => $company->id, 'name' => 'Fornecedor', 'status' => 'active']);
    $brand = Brand::query()->create(['company_id' => $company->id, 'name' => "Marca {$suffix}", 'status' => 'active']);
    $category = Category::query()->create(['company_id' => $company->id, 'name' => "Categoria {$suffix}", 'status' => 'active']);

    return [
        'customer' => $customer,
        'supplier' => $supplier,
        'product' => Product::query()->create([
            'company_id' => $company->id,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => 'Produto',
            'sku' => "P-{$suffix}",
            'sale_price' => 100,
            'cost' => 50,
            'stock' => 1,
            'status' => 'active',
        ]),
        'sale' => Sale::query()->create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'date' => '2026-11-06',
            'total' => 100,
            'status' => 'completed',
            'payment_method' => 'pix',
        ]),
        'purchase' => Purchase::query()->create([
            'company_id' => $company->id,
            'supplier_id' => $supplier->id,
            'date' => '2026-11-06',
            'total' => 50,
            'status' => 'completed',
            'payment_method' => 'pix',
        ]),
    ];
}

beforeEach(function () {
    $this->user = User::factory()->create();
    $company = recordIdFilterCompany('94000000000001');
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $this->user->id, 'role' => 'owner', 'status' => 'active']);
    $this->user->update(['current_company_id' => $company->id]);

    $this->records = recordIdFilterRecords($company);
    recordIdFilterRecords($company);
    $this->otherCompanyRecords = recordIdFilterRecords(recordIdFilterCompany('94000000000002'));
});

test('each listing can show a single record by id', function (string $endpoint, string $record) {
    $id = $this->records[$record]->id;

    $this->actingAs($this->user)->getJson("/api/{$endpoint}?filter[id]={$id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $id);
})->with([
    'sales' => ['sales', 'sale'],
    'purchases' => ['purchases', 'purchase'],
    'customers' => ['customers', 'customer'],
    'suppliers' => ['suppliers', 'supplier'],
    'products' => ['products', 'product'],
]);

test('the id filter never reaches another company', function (string $endpoint, string $record) {
    $id = $this->otherCompanyRecords[$record]->id;

    $this->actingAs($this->user)->getJson("/api/{$endpoint}?filter[id]={$id}")
        ->assertOk()
        ->assertJsonCount(0, 'data');
})->with([
    'sales' => ['sales', 'sale'],
    'purchases' => ['purchases', 'purchase'],
    'customers' => ['customers', 'customer'],
    'suppliers' => ['suppliers', 'supplier'],
    'products' => ['products', 'product'],
]);
