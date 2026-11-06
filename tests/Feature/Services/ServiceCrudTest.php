<?php

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Service;
use App\Models\User;

function servicesCompany(string $document): array
{
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Serviços '.$document,
        'document_type' => 'cnpj',
        'document' => $document,
        'address' => 'Rua Serviço',
        'phone' => '92999999999',
        'email' => "servicos{$document}@test.com",
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
    CompanyUser::query()->create(['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'owner', 'status' => 'active']);
    $user->update(['current_company_id' => $company->id]);

    return [$user, $company];
}

beforeEach(function () {
    [$this->user, $this->company] = servicesCompany('96000000000001');
});

test('a service is created active, with the cost optional', function () {
    $this->actingAs($this->user)->postJson('/api/services', [
        'name' => 'Formatação',
        'description' => 'Formatação com backup',
        'price' => 120,
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Formatação')
        ->assertJsonPath('data.price', 120)
        ->assertJsonPath('data.cost', null)
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.performed_count', 0);

    $this->actingAs($this->user)->postJson('/api/services', [
        'name' => 'Manutenção de impressora',
        'price' => 200,
        'cost' => 90,
    ])
        ->assertCreated()
        ->assertJsonPath('data.cost', 90);
});

test('the name is unique per company and the price is required', function () {
    Service::query()->create(['company_id' => $this->company->id, 'name' => 'Formatação', 'price' => 100, 'status' => 'active']);

    $this->actingAs($this->user)->postJson('/api/services', ['name' => 'Formatação', 'price' => 100])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');

    $this->actingAs($this->user)->postJson('/api/services', ['name' => 'Outro'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('price');

    [$otherUser] = servicesCompany('96000000000002');
    $this->actingAs($otherUser)->postJson('/api/services', ['name' => 'Formatação', 'price' => 100])
        ->assertCreated();
});

test('services are scoped to the company', function () {
    $service = Service::query()->create(['company_id' => $this->company->id, 'name' => 'Formatação', 'price' => 100, 'status' => 'active']);
    [$otherUser] = servicesCompany('96000000000003');

    $this->actingAs($otherUser)->getJson('/api/services')->assertOk()->assertJsonCount(0, 'data');
    $this->actingAs($otherUser)->getJson("/api/services/{$service->id}")->assertForbidden();
    $this->actingAs($otherUser)->putJson("/api/services/{$service->id}", ['name' => 'X', 'price' => 1])->assertForbidden();
    $this->actingAs($otherUser)->deleteJson("/api/services/{$service->id}")->assertForbidden();
});

test('a service is updated and deleted while it was never sold', function () {
    $service = Service::query()->create(['company_id' => $this->company->id, 'name' => 'Formatação', 'price' => 100, 'cost' => 30, 'status' => 'active']);

    $this->actingAs($this->user)->putJson("/api/services/{$service->id}", [
        'name' => 'Formatação completa',
        'price' => 150,
        'cost' => null,
        'status' => 'inactive',
    ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Formatação completa')
        ->assertJsonPath('data.cost', null)
        ->assertJsonPath('data.status', 'inactive');

    $this->actingAs($this->user)->deleteJson("/api/services/{$service->id}")->assertNoContent();
    $this->assertDatabaseMissing('services', ['id' => $service->id]);
});

test('performed count adds the quantities sold, without cancelled sales, and a sold service cannot be deleted', function () {
    $service = Service::query()->create(['company_id' => $this->company->id, 'name' => 'Formatação', 'price' => 100, 'status' => 'active']);
    $sell = function (string $status, float $quantity) use ($service): void {
        $sale = Sale::query()->create([
            'company_id' => $this->company->id,
            'date' => '2026-11-06',
            'total' => 100 * $quantity,
            'status' => $status,
            'payment_method' => 'pix',
        ]);
        SaleItem::query()->create([
            'company_id' => $this->company->id,
            'sale_id' => $sale->id,
            'service_id' => $service->id,
            'quantity' => $quantity,
            'unit_price' => 100,
            'unit_cost' => 0,
            'subtotal' => 100 * $quantity,
        ]);
    };
    $sell('completed', 2);
    $sell('pending', 1);
    $sell('cancelled', 5);

    $this->actingAs($this->user)->getJson('/api/services?sort=performed_count&direction=desc')
        ->assertOk()
        ->assertJsonPath('data.0.performed_count', 3);

    $this->actingAs($this->user)->deleteJson("/api/services/{$service->id}")
        ->assertUnprocessable()
        ->assertJsonValidationErrors('service');
});
