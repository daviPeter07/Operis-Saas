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
        'name' => 'Empresa Categorias',
        'document_type' => 'cnpj',
        'document' => '61000000000001',
        'address' => 'Rua Lista',
        'phone' => '92999999999',
        'email' => 'categorias@test.com',
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

    $this->makeCategory = function (string $name, string $status = 'active', ?Carbon $createdAt = null): Category {
        $category = Category::query()->create(['company_id' => $this->company->id, 'name' => $name, 'status' => $status]);

        if ($createdAt !== null) {
            $category->forceFill(['created_at' => $createdAt])->save();
        }

        return $category;
    };

    ($this->makeCategory)('Periféricos', createdAt: Carbon::parse('2026-10-01 12:00:00', 'UTC'));
    ($this->makeCategory)('Monitores', createdAt: Carbon::parse('2026-10-02 12:00:00', 'UTC'));
    ($this->makeCategory)('Acessórios', createdAt: Carbon::parse('2026-10-03 12:00:00', 'UTC'));
    ($this->makeCategory)('Periféricos antigos', 'inactive', Carbon::parse('2026-10-04 12:00:00', 'UTC'));
});

function listCategories(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/categories?'.http_build_query($query));
}

test('lists categories of every status newest first with 15 per page when no parameters are sent', function () {
    listCategories()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.name', 'Periféricos antigos')
        ->assertJsonPath('data.3.name', 'Periféricos');
});

test('the categories list page renders the categories module', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/categories/index'));
});

test('the name filter matches part of the name', function () {
    expect(listCategories(['filter' => ['name' => 'perif']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Periféricos', 'Periféricos antigos']);
});

test('the status filter narrows to active or inactive categories', function () {
    expect(listCategories(['filter' => ['status' => 'inactive']])->json('data.*.name'))
        ->toBe(['Periféricos antigos'])
        ->and(listCategories(['filter' => ['status' => 'active']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Periféricos', 'Monitores', 'Acessórios']);
});

test('name and registration date sort both ways', function () {
    expect(listCategories(['sort' => 'name', 'direction' => 'asc'])->json('data.*.name'))
        ->toBe(['Acessórios', 'Monitores', 'Periféricos', 'Periféricos antigos'])
        ->and(listCategories(['sort' => 'name', 'direction' => 'desc'])->json('data.0.name'))
        ->toBe('Periféricos antigos')
        ->and(listCategories(['sort' => 'created_at', 'direction' => 'asc'])->json('data.0.name'))
        ->toBe('Periféricos');
});

test('pagination respects per_page and page', function () {
    listCategories(['per_page' => 3, 'page' => 2, 'sort' => 'name', 'direction' => 'asc'])
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.name', 'Periféricos antigos');
});

test('period filter uses Manaus calendar days on registration date', function () {
    // 01:30 UTC on Oct 6 is still Oct 5 in Manaus (UTC-4).
    ($this->makeCategory)('Cadastrada à noite', createdAt: Carbon::parse('2026-10-06 01:30:00', 'UTC'));

    expect(listCategories(['date_from' => '2026-10-05', 'date_to' => '2026-10-05'])->json('data.*.name'))
        ->toBe(['Cadastrada à noite'])
        ->and(listCategories(['date_from' => '2026-10-06', 'date_to' => '2026-10-06'])->json('data'))
        ->toBe([]);
});

test('unknown sort keys, filters and values are rejected', function () {
    listCategories(['sort' => 'company_id'])->assertUnprocessable()->assertJsonValidationErrors('sort');
    listCategories(['filter' => ['company_id' => 1]])->assertUnprocessable()->assertJsonValidationErrors('filter');
    listCategories(['filter' => ['status' => 'deleted']])->assertUnprocessable()->assertJsonValidationErrors('filter.status');
    listCategories(['per_page' => 500])->assertUnprocessable()->assertJsonValidationErrors('per_page');
});

test('categories from other companies never appear', function () {
    $otherCompany = Company::query()->create([
        'name' => 'Outra',
        'document_type' => 'cnpj',
        'document' => '61000000000002',
        'address' => 'Rua Outra',
        'phone' => '92999999999',
        'email' => 'outra-categorias@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    Category::query()->create(['company_id' => $otherCompany->id, 'name' => 'Periféricos de outra empresa', 'status' => 'active']);

    expect(listCategories(['filter' => ['name' => 'perif']])->json('data.*.name'))
        ->not->toContain('Periféricos de outra empresa')
        ->and(listCategories()->json('meta.total'))->toBe(4);
});

test('each category counts its active products and sorts by that count', function () {
    $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => 'Marca', 'status' => 'active']);
    $makeProduct = fn (string $category, string $sku, string $status = 'active') => Product::query()->create([
        'company_id' => $this->company->id,
        'category_id' => Category::query()->where('name', $category)->value('id'),
        'brand_id' => $brand->id,
        'name' => "Produto {$sku}",
        'sku' => $sku,
        'sale_price' => 10,
        'cost' => 5,
        'stock' => 1,
        'status' => $status,
    ]);
    $makeProduct('Monitores', 'M-1');
    $makeProduct('Monitores', 'M-2');
    $makeProduct('Monitores', 'M-3', 'inactive');
    $makeProduct('Acessórios', 'A-1');

    $response = listCategories(['sort' => 'products_count', 'direction' => 'desc']);

    expect($response->json('data.0.name'))->toBe('Monitores')
        ->and($response->json('data.0.products_count'))->toBe(2)
        ->and($response->json('data.1.name'))->toBe('Acessórios')
        ->and($response->json('data.1.products_count'))->toBe(1);
});
