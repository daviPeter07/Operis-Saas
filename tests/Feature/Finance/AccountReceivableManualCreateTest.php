<?php

use App\Models\AccountReceivable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\User;

test('manual account receivable can be created without sale relation', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa Manual',
        'document_type' => 'cnpj',
        'document' => '50000000000005',
        'address' => 'Rua Manual',
        'phone' => '92999999995',
        'email' => 'manual@test.com',
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
    $customer = Customer::query()->create([
        'company_id' => $company->id,
        'name' => 'Cliente Manual',
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Servico avulso',
        'description' => 'Lancamento manual',
        'amount' => 75.5,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-05-20',
        'payment_method' => 'pix',
        'status' => 'pending',
    ])->assertCreated();

    $this->assertDatabaseHas('account_receivables', [
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'sale_id' => null,
        'item' => 'Servico avulso',
        'description' => 'Lancamento manual',
        'amount' => 75.5,
        'entry_date' => '2026-05-06 00:00:00',
        'due_date' => '2026-05-20 00:00:00',
        'status' => 'pending',
        'payment_method' => 'pix',
    ]);

    // A boleto is split month by month, leftover cents on the first one.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Parcelado no boleto',
        'amount' => 100,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-05-06',
        'payment_method' => 'boleto',
        'boleto_term_days' => 90,
        'status' => 'pending',
    ])->assertCreated();

    $boletos = AccountReceivable::query()->where('item', 'Parcelado no boleto')->orderBy('installment_number')->get();
    expect($boletos->pluck('amount')->all())->toBe(['33.34', '33.33', '33.33'])
        ->and($boletos->map(fn ($boleto) => $boleto->due_date->toDateString())->all())->toBe(['2026-06-06', '2026-07-06', '2026-08-06'])
        ->and($boletos->pluck('total_installments')->unique()->all())->toBe([3]);

    // Saved as received: settled on the entry date.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Recebido na hora',
        'amount' => 50,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-05-06',
        'payment_method' => 'cash',
        'status' => 'received',
    ])->assertCreated();

    $received = AccountReceivable::query()->where('item', 'Recebido na hora')->firstOrFail();
    expect($received->status)->toBe('received')
        ->and($received->amount_paid)->toBe('50.00')
        ->and($received->received_at->toDateString())->toBe('2026-05-06');

    // The due date cannot come before the entry date.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Data errada',
        'amount' => 10,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-05-01',
        'payment_method' => 'pix',
        'status' => 'pending',
    ])->assertUnprocessable()->assertJsonValidationErrors('due_date');
});
