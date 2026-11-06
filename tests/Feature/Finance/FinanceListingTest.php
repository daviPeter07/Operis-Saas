<?php

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = Company::query()->create([
        'name' => 'Empresa Financeiro',
        'document_type' => 'cnpj',
        'document' => '91000000000001',
        'address' => 'Rua Financeiro',
        'phone' => '92999999999',
        'email' => 'financeiro@test.com',
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

    $ana = Customer::query()->create(['company_id' => $this->company->id, 'name' => 'Ana Souza', 'status' => 'active']);
    $bruno = Customer::query()->create(['company_id' => $this->company->id, 'name' => 'Bruno Lima', 'status' => 'active']);
    $norte = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Distribuidora Norte', 'status' => 'active']);
    $sul = Supplier::query()->create(['company_id' => $this->company->id, 'name' => 'Atacado Sul', 'status' => 'active']);

    $receivable = fn (array $attributes): AccountReceivable => AccountReceivable::query()->create([
        'company_id' => $this->company->id,
        'entry_date' => '2026-11-01',
        'amount_paid' => 0,
        'status' => 'pending',
        ...$attributes,
    ]);
    $receivable(['customer_id' => $ana->id, 'item' => 'Conserto de notebook', 'amount' => 150, 'due_date' => '2026-11-20']);
    $receivable(['customer_id' => $bruno->id, 'item' => 'Venda de cabo', 'amount' => 40, 'due_date' => '2026-12-05', 'status' => 'received', 'amount_paid' => 40]);
    $receivable(['customer_id' => $bruno->id, 'item' => 'Antiga', 'amount' => 90, 'due_date' => '2026-11-10', 'status' => 'cancelled']);

    $payable = fn (array $attributes): AccountPayable => AccountPayable::query()->create([
        'company_id' => $this->company->id,
        'entry_date' => '2026-11-01',
        'amount_paid' => 0,
        'status' => 'pending',
        ...$attributes,
    ]);
    $payable(['supplier_id' => $norte->id, 'item' => 'Aluguel', 'description' => 'Loja do centro', 'amount' => 1200, 'due_date' => '2026-11-10']);
    $payable(['supplier_id' => $sul->id, 'item' => 'Energia', 'amount' => 300, 'due_date' => '2026-11-25', 'status' => 'paid', 'amount_paid' => 300]);
});

test('receivables are filtered by customer, description, status and origin on the server', function () {
    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[customer]=ana')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.customer_name', 'Ana Souza');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[description]=conserto')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[status]=received')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Venda de cabo');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[origin]=manual')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[origin]=sale')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('cancelled receivables only show up when the status filter asks for them', function () {
    $this->actingAs($this->user)->getJson('/api/account-receivables')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[status]=cancelled')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Antiga');
});

test('receivables sort by amount and filter the period by due date', function () {
    $this->actingAs($this->user)->getJson('/api/account-receivables?sort=amount&direction=asc')
        ->assertOk()
        ->assertJsonPath('data.0.total_amount', '40.00')
        ->assertJsonPath('data.1.total_amount', '150.00');

    $this->actingAs($this->user)->getJson('/api/account-receivables?date_from=2026-12-01&date_to=2026-12-31')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Venda de cabo');
});

test('payables are filtered by supplier, description and status on the server', function () {
    $this->actingAs($this->user)->getJson('/api/account-payables?filter[supplier]=norte')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.supplier_name', 'Distribuidora Norte');

    $this->actingAs($this->user)->getJson('/api/account-payables?filter[description]=centro')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Aluguel');

    $this->actingAs($this->user)->getJson('/api/account-payables?filter[status]=paid')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Energia');

    $this->actingAs($this->user)->getJson('/api/account-payables?sort=due_date&direction=desc')
        ->assertOk()
        ->assertJsonPath('data.0.item', 'Energia');
});

test('the details endpoints return the customer and supplier names', function () {
    $receivable = AccountReceivable::query()->where('item', 'Conserto de notebook')->firstOrFail();
    $payable = AccountPayable::query()->where('item', 'Aluguel')->firstOrFail();

    $this->actingAs($this->user)->getJson("/api/account-receivables/{$receivable->id}")
        ->assertOk()
        ->assertJsonPath('data.customer_name', 'Ana Souza');

    $this->actingAs($this->user)->getJson("/api/account-payables/{$payable->id}")
        ->assertOk()
        ->assertJsonPath('data.supplier_name', 'Distribuidora Norte');
});

test('the listing can show only the accounts of one purchase', function () {
    $payable = AccountPayable::query()->where('item', 'Aluguel')->firstOrFail();
    $purchase = Purchase::query()->create([
        'company_id' => $this->company->id,
        'supplier_id' => $payable->supplier_id,
        'date' => '2026-11-01',
        'total' => 1200,
        'status' => 'pending',
        'payment_method' => 'pix',
    ]);
    $payable->update(['purchase_id' => $purchase->id]);

    $this->actingAs($this->user)->getJson("/api/account-payables?filter[purchase]={$purchase->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Aluguel');

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[sale]=999999')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('the overdue status lists open accounts past their due date', function () {
    $this->travelTo('2026-11-15 12:00:00');

    // Receivables: "Conserto" is due 20/11, "Antiga" is cancelled, "Venda de cabo" is received.
    AccountReceivable::query()->where('item', 'Conserto de notebook')->update(['due_date' => '2026-11-10']);

    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[status]=overdue')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Conserto de notebook');

    // Payables: "Aluguel" (pending, due 10/11) is overdue; "Energia" is paid.
    $this->actingAs($this->user)->getJson('/api/account-payables?filter[status]=overdue')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.item', 'Aluguel');
});

test('invalid filters are rejected', function () {
    $this->actingAs($this->user)->getJson('/api/account-receivables?filter[status]=paid')
        ->assertUnprocessable();

    $this->actingAs($this->user)->getJson('/api/account-payables?filter[origin]=sale')
        ->assertUnprocessable();
});
