<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Lista',
        'document_type' => 'cnpj',
        'document' => '60000000000001',
        'address' => 'Rua Lista',
        'phone' => '92999999999',
        'email' => 'lista@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create([
        'company_id' => $this->company->id,
        'user_id' => $this->user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $this->user->update(['current_company_id' => $this->company->id]);

    $this->logitech = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Logitech', 'status' => 'active']);
    $this->samsung = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Samsung', 'status' => 'active']);
    $this->peripherals = Category::query()->create(['company_id' => $this->company->id, 'name' => 'Periféricos', 'status' => 'active']);

    $this->makeProduct = function (array $attributes): Product {
        return Product::query()->create([
            'company_id' => $this->company->id,
            'category_id' => $this->peripherals->id,
            'brand_id' => $this->logitech->id,
            'cost' => 10,
            'stock' => 5,
            'min_stock' => 1,
            'status' => 'active',
            ...$attributes,
        ]);
    };

    ($this->makeProduct)(['name' => 'Mouse sem fio', 'sku' => 'MOU-01', 'sale_price' => 89.9]);
    ($this->makeProduct)(['name' => 'Teclado mecânico', 'sku' => 'TEC-01', 'sale_price' => 349.9, 'stock' => 0]);
    ($this->makeProduct)(['name' => 'Monitor 24', 'sku' => 'MON-24', 'sale_price' => 899, 'brand_id' => $this->samsung->id]);
    ($this->makeProduct)(['name' => 'Mouse antigo', 'sku' => 'MOU-00', 'sale_price' => 19.9, 'status' => 'inactive']);
});

function listProducts(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/products?'.http_build_query($query));
}

test('lists products newest first with 15 per page when no parameters are sent', function () {
    listProducts()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.name', 'Mouse antigo');
});

test('text filters match part of the value', function () {
    $names = listProducts(['filter' => ['name' => 'mouse']])->json('data.*.name');

    expect($names)->toEqualCanonicalizing(['Mouse sem fio', 'Mouse antigo']);
});

test('the code filter also finds products by barcode', function () {
    ($this->makeProduct)(['name' => 'Webcam', 'sku' => 'WEB-01', 'barcode' => '7891234567890', 'sale_price' => 150]);

    expect(listProducts(['filter' => ['sku' => '78912345']])->json('data.*.name'))->toBe(['Webcam'])
        ->and(listProducts(['filter' => ['sku' => 'MOU']])->json('data.*.name'))->toEqualCanonicalizing(['Mouse sem fio', 'Mouse antigo']);
});

test('the inventory list page renders the inventory module', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/inventory')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/inventory/index'));
});

test('the product details page opens at the inventory URL with the product id', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/inventory/42')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/inventory/show')->where('productId', 42));

    $this->actingAs($this->user)->get('/dashboard/inventory/abc')->assertNotFound();
});

test('exact filters narrow by brand and status', function () {
    expect(listProducts(['filter' => ['brand_id' => $this->samsung->id]])->json('data.*.name'))
        ->toBe(['Monitor 24'])
        ->and(listProducts(['filter' => ['status' => 'inactive']])->json('data.*.name'))
        ->toBe(['Mouse antigo']);
});

test('out of stock filter keeps products with no stock', function () {
    expect(listProducts(['filter' => ['stock_status' => 'out_of_stock']])->json('data.*.name'))
        ->toBe(['Teclado mecânico']);
});

test('numeric columns sort both ways', function () {
    expect(listProducts(['sort' => 'sale_price', 'direction' => 'desc'])->json('data.*.name'))
        ->toBe(['Monitor 24', 'Teclado mecânico', 'Mouse sem fio', 'Mouse antigo'])
        ->and(listProducts(['sort' => 'sale_price', 'direction' => 'asc'])->json('data.0.name'))
        ->toBe('Mouse antigo');
});

test('pagination respects per_page and page', function () {
    listProducts(['per_page' => 2, 'page' => 2, 'sort' => 'sale_price', 'direction' => 'desc'])
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.name', 'Mouse sem fio');
});

test('period filter uses Manaus calendar days on registration date', function () {
    // 01:30 UTC on Oct 6 is still Oct 5 in Manaus (UTC-4).
    $this->travelTo(Carbon::parse('2026-10-06 01:30:00', 'UTC'));
    ($this->makeProduct)(['name' => 'Cadastrado à noite', 'sku' => 'NOI-01', 'sale_price' => 50]);
    $this->travelBack();

    expect(listProducts(['date_from' => '2026-10-05', 'date_to' => '2026-10-05'])->json('data.*.name'))
        ->toBe(['Cadastrado à noite'])
        ->and(listProducts(['date_from' => '2026-10-06', 'date_to' => '2026-10-06'])->json('data'))
        ->toBe([]);
});

test('unknown sort keys and filters are rejected', function () {
    listProducts(['sort' => 'company_id'])->assertUnprocessable()->assertJsonValidationErrors('sort');
    listProducts(['filter' => ['company_id' => 1]])->assertUnprocessable()->assertJsonValidationErrors('filter');
    listProducts(['per_page' => 500])->assertUnprocessable()->assertJsonValidationErrors('per_page');
});

test('products from other companies never appear', function () {
    $otherCompany = Company::query()->create([
        'name' => 'Outra',
        'document_type' => 'cnpj',
        'document' => '60000000000002',
        'address' => 'Rua Outra',
        'phone' => '92999999999',
        'email' => 'outra@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    $otherCategory = Category::query()->create(['company_id' => $otherCompany->id, 'name' => 'Outra', 'status' => 'active']);
    $otherBrand = Brand::query()->create(['company_id' => $otherCompany->id, 'name' => 'Outra', 'status' => 'active']);
    Product::query()->create([
        'company_id' => $otherCompany->id,
        'category_id' => $otherCategory->id,
        'brand_id' => $otherBrand->id,
        'name' => 'Mouse de outra empresa',
        'sku' => 'OUT-01',
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 1,
        'status' => 'active',
    ]);

    expect(listProducts(['filter' => ['name' => 'mouse']])->json('data.*.name'))
        ->not->toContain('Mouse de outra empresa');
});
