<?php

use App\Models\Brand;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Marcas',
        'document_type' => 'cnpj',
        'document' => '62000000000001',
        'address' => 'Rua Lista',
        'phone' => '92999999999',
        'email' => 'marcas@test.com',
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

    $this->makeBrand = function (string $name, string $status = 'active', ?Carbon $createdAt = null): Brand {
        $brand = Brand::query()->create(['company_id' => $this->company->id, 'name' => $name, 'status' => $status]);

        if ($createdAt !== null) {
            $brand->forceFill(['created_at' => $createdAt])->save();
        }

        return $brand;
    };

    ($this->makeBrand)('Logitech', createdAt: Carbon::parse('2026-10-01 12:00:00', 'UTC'));
    ($this->makeBrand)('Samsung', createdAt: Carbon::parse('2026-10-02 12:00:00', 'UTC'));
    ($this->makeBrand)('Dell', createdAt: Carbon::parse('2026-10-03 12:00:00', 'UTC'));
    ($this->makeBrand)('Logitech antiga', 'inactive', Carbon::parse('2026-10-04 12:00:00', 'UTC'));
});

function listBrands(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/brands?'.http_build_query($query));
}

test('lists brands of every status newest first with 15 per page when no parameters are sent', function () {
    listBrands()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.name', 'Logitech antiga')
        ->assertJsonPath('data.3.name', 'Logitech');
});

test('the brands list page renders the brands module', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/brands')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/brands/index'));
});

test('the name filter matches part of the name', function () {
    expect(listBrands(['filter' => ['name' => 'logi']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Logitech', 'Logitech antiga']);
});

test('the status filter narrows to active or inactive brands', function () {
    expect(listBrands(['filter' => ['status' => 'inactive']])->json('data.*.name'))
        ->toBe(['Logitech antiga'])
        ->and(listBrands(['filter' => ['status' => 'active']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Logitech', 'Samsung', 'Dell']);
});

test('name and registration date sort both ways', function () {
    expect(listBrands(['sort' => 'name', 'direction' => 'asc'])->json('data.*.name'))
        ->toBe(['Dell', 'Logitech', 'Logitech antiga', 'Samsung'])
        ->and(listBrands(['sort' => 'name', 'direction' => 'desc'])->json('data.0.name'))
        ->toBe('Samsung')
        ->and(listBrands(['sort' => 'created_at', 'direction' => 'asc'])->json('data.0.name'))
        ->toBe('Logitech');
});

test('pagination respects per_page and page', function () {
    listBrands(['per_page' => 3, 'page' => 2, 'sort' => 'name', 'direction' => 'asc'])
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.name', 'Samsung');
});

test('period filter uses Manaus calendar days on registration date', function () {
    // 01:30 UTC on Oct 6 is still Oct 5 in Manaus (UTC-4).
    ($this->makeBrand)('Cadastrada à noite', createdAt: Carbon::parse('2026-10-06 01:30:00', 'UTC'));

    expect(listBrands(['date_from' => '2026-10-05', 'date_to' => '2026-10-05'])->json('data.*.name'))
        ->toBe(['Cadastrada à noite'])
        ->and(listBrands(['date_from' => '2026-10-06', 'date_to' => '2026-10-06'])->json('data'))
        ->toBe([]);
});

test('unknown sort keys, filters and values are rejected', function () {
    listBrands(['sort' => 'company_id'])->assertUnprocessable()->assertJsonValidationErrors('sort');
    listBrands(['filter' => ['company_id' => 1]])->assertUnprocessable()->assertJsonValidationErrors('filter');
    listBrands(['filter' => ['status' => 'deleted']])->assertUnprocessable()->assertJsonValidationErrors('filter.status');
    listBrands(['per_page' => 500])->assertUnprocessable()->assertJsonValidationErrors('per_page');
});

test('brands from other companies never appear', function () {
    $otherCompany = Company::query()->create([
        'name' => 'Outra',
        'document_type' => 'cnpj',
        'document' => '62000000000002',
        'address' => 'Rua Outra',
        'phone' => '92999999999',
        'email' => 'outra-marcas@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    Brand::query()->create(['company_id' => $otherCompany->id, 'name' => 'Logitech de outra empresa', 'status' => 'active']);

    expect(listBrands(['filter' => ['name' => 'logi']])->json('data.*.name'))
        ->not->toContain('Logitech de outra empresa')
        ->and(listBrands()->json('meta.total'))->toBe(4);
});
