<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Fornecedores',
        'document_type' => 'cnpj',
        'document' => '70000000000001',
        'address' => 'Rua Lista',
        'phone' => '92999999999',
        'email' => 'fornecedores@test.com',
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

    $this->makeSupplier = function (array $attributes): Supplier {
        return Supplier::query()->create([
            'company_id' => $this->company->id,
            'person_type' => 'pj',
            'status' => 'active',
            ...$attributes,
        ]);
    };

    ($this->makeSupplier)(['name' => 'Atacadão Norte', 'document' => '12.345.678/0001-90', 'email' => 'vendas@atacadao.com', 'phone' => '(92) 98888-7777']);
    ($this->makeSupplier)(['name' => 'Distribuidora Sul', 'document' => '98765432000110', 'email' => 'contato@sul.com', 'phone' => '92977776666']);
    ($this->makeSupplier)(['name' => 'João Silva', 'person_type' => 'pf', 'document' => '123.456.789-01', 'email' => 'joao@gmail.com']);
    ($this->makeSupplier)(['name' => 'Bazar Antigo', 'status' => 'inactive']);
});

function listSuppliers(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/suppliers?'.http_build_query($query));
}

test('lists suppliers newest first with 15 per page when no parameters are sent', function () {
    listSuppliers()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.name', 'Bazar Antigo');
});

test('the suppliers list page renders the suppliers module', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/suppliers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/suppliers/index'));
});

test('the supplier details page opens at the suppliers URL with the supplier id', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/suppliers/42')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/suppliers/show')->where('supplierId', 42));

    $this->actingAs($this->user)->get('/dashboard/suppliers/abc')->assertNotFound();
});

test('name and e-mail filters match part of the value', function () {
    expect(listSuppliers(['filter' => ['name' => 'dist']])->json('data.*.name'))->toBe(['Distribuidora Sul'])
        ->and(listSuppliers(['filter' => ['email' => 'gmail']])->json('data.*.name'))->toBe(['João Silva']);
});

test('the document filter matches digits with or without the mask', function () {
    expect(listSuppliers(['filter' => ['document' => '12345678']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Atacadão Norte', 'João Silva'])
        ->and(listSuppliers(['filter' => ['document' => '12.345.678/0001']])->json('data.*.name'))
        ->toBe(['Atacadão Norte'])
        ->and(listSuppliers(['filter' => ['document' => '98.765.432']])->json('data.*.name'))
        ->toBe(['Distribuidora Sul']);
});

test('the phone filter matches digits with or without the mask', function () {
    expect(listSuppliers(['filter' => ['phone' => '988887777']])->json('data.*.name'))->toBe(['Atacadão Norte'])
        ->and(listSuppliers(['filter' => ['phone' => '(92) 97777']])->json('data.*.name'))->toBe(['Distribuidora Sul']);
});

test('exact filters narrow by person type and status', function () {
    expect(listSuppliers(['filter' => ['person_type' => 'pf']])->json('data.*.name'))
        ->toBe(['João Silva'])
        ->and(listSuppliers(['filter' => ['status' => 'inactive']])->json('data.*.name'))
        ->toBe(['Bazar Antigo']);
});

test('the name column sorts both ways', function () {
    expect(listSuppliers(['sort' => 'name', 'direction' => 'asc'])->json('data.*.name'))
        ->toBe(['Atacadão Norte', 'Bazar Antigo', 'Distribuidora Sul', 'João Silva'])
        ->and(listSuppliers(['sort' => 'name', 'direction' => 'desc'])->json('data.0.name'))
        ->toBe('João Silva');
});

test('pagination respects per_page and page', function () {
    listSuppliers(['per_page' => 3, 'page' => 2, 'sort' => 'name', 'direction' => 'asc'])
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.name', 'João Silva');
});

test('period filter uses Manaus calendar days on registration date', function () {
    // 01:30 UTC on Oct 6 is still Oct 5 in Manaus (UTC-4).
    $this->travelTo(Carbon::parse('2026-10-06 01:30:00', 'UTC'));
    ($this->makeSupplier)(['name' => 'Cadastrado à noite']);
    $this->travelBack();

    expect(listSuppliers(['date_from' => '2026-10-05', 'date_to' => '2026-10-05'])->json('data.*.name'))
        ->toBe(['Cadastrado à noite'])
        ->and(listSuppliers(['date_from' => '2026-10-06', 'date_to' => '2026-10-06'])->json('data'))
        ->toBe([]);
});

test('unknown sort keys and filters are rejected', function () {
    listSuppliers(['sort' => 'company_id'])->assertUnprocessable()->assertJsonValidationErrors('sort');
    listSuppliers(['filter' => ['company_id' => 1]])->assertUnprocessable()->assertJsonValidationErrors('filter');
    listSuppliers(['filter' => ['person_type' => 'xx']])->assertUnprocessable()->assertJsonValidationErrors('filter.person_type');
    listSuppliers(['per_page' => 500])->assertUnprocessable()->assertJsonValidationErrors('per_page');
});

test('suppliers from other companies never appear', function () {
    $otherCompany = Company::query()->create([
        'name' => 'Outra',
        'document_type' => 'cnpj',
        'document' => '70000000000002',
        'address' => 'Rua Outra',
        'phone' => '92999999999',
        'email' => 'outra@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    Supplier::query()->create([
        'company_id' => $otherCompany->id,
        'name' => 'Atacadão de outra empresa',
        'person_type' => 'pj',
        'status' => 'active',
    ]);

    expect(listSuppliers(['filter' => ['name' => 'atacadão']])->json('data.*.name'))
        ->toBe(['Atacadão Norte']);
});
