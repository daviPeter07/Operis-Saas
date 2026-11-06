<?php

use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Clientes',
        'document_type' => 'cnpj',
        'document' => '61000000000001',
        'address' => 'Rua Clientes',
        'phone' => '92999999999',
        'email' => 'clientes@test.com',
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

    $this->makeCustomer = function (array $attributes): Customer {
        return Customer::query()->create([
            'company_id' => $this->company->id,
            'status' => 'active',
            ...$attributes,
        ]);
    };

    $this->ana = ($this->makeCustomer)([
        'name' => 'Ana Souza',
        'email' => 'ana@cliente.com',
        'phone' => '(92) 99111-2222',
        'document' => '123.456.789-01',
        'credit_enabled' => true,
        'credit_limit' => 1000,
    ]);
    ($this->makeCustomer)([
        'name' => 'Bruno Lima',
        'email' => 'bruno@cliente.com',
        'phone' => '92988887777',
        'document' => '98765432100',
        'credit_limit' => 300,
    ]);
    ($this->makeCustomer)([
        'name' => 'Comercial Norte Ltda',
        'email' => 'contato@norte.com',
        'document' => '12.345.678/0001-90',
        'person_type' => 'pj',
        'credit_enabled' => true,
        'credit_limit' => 5000,
    ]);
    ($this->makeCustomer)(['name' => 'Cliente sem documento', 'status' => 'inactive']);
});

function listCustomers(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/customers?'.http_build_query($query));
}

test('lists customers newest first with 15 per page when no parameters are sent', function () {
    listCustomers()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.name', 'Cliente sem documento');
});

test('the clients list page renders the clients module', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/clients')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/clients/index'));
});

test('the customer details page opens at the clients URL with the customer id', function () {
    $this->actingAs($this->user)
        ->get('/dashboard/clients/42')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/clients/show')->where('customerId', 42));

    $this->actingAs($this->user)->get('/dashboard/clients/abc')->assertNotFound();
});

test('name and e-mail filters match part of the value', function () {
    expect(listCustomers(['filter' => ['name' => 'ana']])->json('data.*.name'))->toBe(['Ana Souza'])
        ->and(listCustomers(['filter' => ['email' => '@cliente']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Ana Souza', 'Bruno Lima']);
});

test('document and phone filters match the digits with or without the mask', function () {
    expect(listCustomers(['filter' => ['document' => '456789']])->json('data.*.name'))->toBe(['Ana Souza'])
        ->and(listCustomers(['filter' => ['document' => '987.654']])->json('data.*.name'))->toBe(['Bruno Lima'])
        ->and(listCustomers(['filter' => ['document' => '345.678/0001']])->json('data.*.name'))->toBe(['Comercial Norte Ltda'])
        ->and(listCustomers(['filter' => ['phone' => '99111-2222']])->json('data.*.name'))->toBe(['Ana Souza'])
        ->and(listCustomers(['filter' => ['phone' => '(92) 98888']])->json('data.*.name'))->toBe(['Bruno Lima']);
});

test('person type filter uses the saved person type', function () {
    expect(listCustomers(['filter' => ['person_type' => 'pj']])->json('data.*.name'))
        ->toBe(['Comercial Norte Ltda'])
        ->and(listCustomers(['filter' => ['person_type' => 'pf']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Ana Souza', 'Bruno Lima', 'Cliente sem documento']);
});

test('status and store credit filters narrow the list', function () {
    expect(listCustomers(['filter' => ['status' => 'inactive']])->json('data.*.name'))
        ->toBe(['Cliente sem documento'])
        ->and(listCustomers(['filter' => ['credit_enabled' => '1']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Ana Souza', 'Comercial Norte Ltda'])
        ->and(listCustomers(['filter' => ['credit_enabled' => '0']])->json('data.*.name'))
        ->toEqualCanonicalizing(['Bruno Lima', 'Cliente sem documento']);
});

test('credit limit sorts both ways', function () {
    expect(listCustomers(['sort' => 'credit_limit', 'direction' => 'desc'])->json('data.*.name'))
        ->toBe(['Comercial Norte Ltda', 'Ana Souza', 'Bruno Lima', 'Cliente sem documento'])
        ->and(listCustomers(['sort' => 'name', 'direction' => 'asc'])->json('data.0.name'))
        ->toBe('Ana Souza');
});

test('the table listing and the details bring the open store credit balance', function () {
    $receivable = fn (string $status, float $amount) => AccountReceivable::query()->create([
        'company_id' => $this->company->id,
        'customer_id' => $this->ana->id,
        'entry_date' => now()->toDateString(),
        'due_date' => now()->addDays(30)->toDateString(),
        'item' => 'Parcela',
        'amount' => $amount,
        'amount_paid' => 0,
        'status' => $status,
    ]);
    $receivable('pending', 200);
    $receivable('partial', 50);
    $receivable('received', 400);
    $receivable('cancelled', 100);

    listCustomers(['filter' => ['name' => 'ana']])
        ->assertJsonPath('data.0.open_balance', 250);
    listCustomers(['filter' => ['name' => 'bruno']])
        ->assertJsonPath('data.0.open_balance', 0);

    $this->actingAs($this->user)
        ->getJson("/api/customers/{$this->ana->id}")
        ->assertOk()
        ->assertJsonPath('data.open_balance', 250);
});

test('pagination respects per_page and page', function () {
    listCustomers(['per_page' => 3, 'page' => 2, 'sort' => 'name', 'direction' => 'asc'])
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.name', 'Comercial Norte Ltda');
});

test('period filter uses Manaus calendar days on registration date', function () {
    // 01:30 UTC on Oct 6 is still Oct 5 in Manaus (UTC-4).
    $this->travelTo(Carbon::parse('2026-10-06 01:30:00', 'UTC'));
    ($this->makeCustomer)(['name' => 'Cadastrado à noite']);
    $this->travelBack();

    expect(listCustomers(['date_from' => '2026-10-05', 'date_to' => '2026-10-05'])->json('data.*.name'))
        ->toBe(['Cadastrado à noite'])
        ->and(listCustomers(['date_from' => '2026-10-06', 'date_to' => '2026-10-06'])->json('data'))
        ->toBe([]);
});

test('unknown sort keys and filters are rejected', function () {
    listCustomers(['sort' => 'company_id'])->assertUnprocessable()->assertJsonValidationErrors('sort');
    listCustomers(['filter' => ['company_id' => 1]])->assertUnprocessable()->assertJsonValidationErrors('filter');
    listCustomers(['filter' => ['person_type' => 'xx']])->assertUnprocessable()->assertJsonValidationErrors('filter.person_type');
});

test('customers from other companies never appear', function () {
    $otherCompany = Company::query()->create([
        'name' => 'Outra',
        'document_type' => 'cnpj',
        'document' => '61000000000002',
        'address' => 'Rua Outra',
        'phone' => '92999999999',
        'email' => 'outra@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    Customer::query()->create([
        'company_id' => $otherCompany->id,
        'name' => 'Ana de outra empresa',
        'document' => '123.456.789-01',
        'status' => 'active',
    ]);

    expect(listCustomers(['filter' => ['document' => '123456789']])->json('data.*.name'))
        ->toBe(['Ana Souza']);
});

test('the person type sent by the form is saved and returned', function () {
    $this->actingAs($this->user)
        ->postJson('/api/customers', [
            'name' => 'Loja Centro Ltda',
            'email' => 'loja@centro.com',
            'document' => '98.765.432/0001-10',
            'person_type' => 'pj',
        ])
        ->assertCreated()
        ->assertJsonPath('data.person_type', 'pj');

    $customer = Customer::query()->where('name', 'Loja Centro Ltda')->firstOrFail();

    $this->actingAs($this->user)
        ->putJson("/api/customers/{$customer->id}", [
            'name' => 'Loja Centro Ltda',
            'email' => 'loja@centro.com',
            'document' => '123.456.789-00',
            'person_type' => 'pf',
        ])
        ->assertOk()
        ->assertJsonPath('data.person_type', 'pf');
});

test('the backfill marks only customers with a CNPJ as pj', function () {
    $saved = ($this->makeCustomer)(['name' => 'Salvo como PF', 'document' => '11.222.333/0001-44', 'person_type' => 'pf']);
    $person = ($this->makeCustomer)(['name' => 'Pessoa', 'document' => '111.222.333-44', 'person_type' => 'pf']);
    $oddDocument = ($this->makeCustomer)(['name' => 'Documento de 12 dígitos', 'document' => '100000000005', 'person_type' => 'pf']);

    (require database_path('migrations/2026_11_05_230000_backfill_customer_person_type.php'))->up();

    expect($saved->fresh()->person_type)->toBe('pj')
        ->and($person->fresh()->person_type)->toBe('pf')
        ->and($oddDocument->fresh()->person_type)->toBe('pf');
});
