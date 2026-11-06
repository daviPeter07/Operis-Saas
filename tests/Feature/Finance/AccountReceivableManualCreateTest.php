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

    // Crediário is split like a sale: floor in cents, leftover on the last one, month by
    // month from the first installment (clamped to the month end), always open.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Parcelado no crediario',
        'amount' => 100,
        'entry_date' => '2026-01-06',
        'due_date' => '2026-01-31',
        'payment_method' => 'crediario',
        'installments' => 3,
        'status' => 'received',
    ])->assertCreated();

    $installments = AccountReceivable::query()->where('item', 'Parcelado no crediario')->orderBy('installment_number')->get();
    expect($installments->pluck('amount')->all())->toBe(['33.33', '33.33', '33.34'])
        ->and($installments->map(fn ($installment) => $installment->due_date->toDateString())->all())->toBe(['2026-01-31', '2026-02-28', '2026-03-31'])
        ->and($installments->pluck('total_installments')->unique()->all())->toBe([3])
        ->and($installments->pluck('status')->unique()->all())->toBe(['pending'])
        ->and($installments->pluck('payment_method')->unique()->all())->toBe(['crediario']);

    // Crediário needs the number of installments; boleto is not a receivable method.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Sem parcelas',
        'amount' => 100,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-06-06',
        'payment_method' => 'crediario',
        'status' => 'pending',
    ])->assertUnprocessable()->assertJsonValidationErrors('installments');

    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Boleto',
        'amount' => 100,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-06-06',
        'payment_method' => 'boleto',
        'status' => 'pending',
    ])->assertUnprocessable()->assertJsonValidationErrors('payment_method');

    // Saved as received: settled on the entry date.
    $this->actingAs($user)->postJson('/api/account-receivables', [
        'customer_id' => $customer->id,
        'item' => 'Recebido na hora',
        'amount' => 50,
        'entry_date' => '2026-05-06',
        'due_date' => '2026-05-06',
        'payment_method' => 'card_debit',
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
