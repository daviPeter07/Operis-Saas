<?php

use App\Models\AccountPayable;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Carbon;

test('manual boleto account payable with 120 days creates four monthly installments', function () {
    $user = User::factory()->create();
    $company = Company::query()->create([
        'name' => 'Empresa AP Boleto Manual',
        'document_type' => 'cnpj',
        'document' => '40000000000567',
        'address' => 'Rua Boleto Manual',
        'phone' => '92999999998',
        'email' => 'manual-boleto-ap@test.com',
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

    $supplier = Supplier::query()->create([
        'company_id' => $company->id,
        'name' => 'Fornecedor Manual Boleto',
        'status' => 'active',
    ]);

    $entryDate = '2026-05-20';

    $this->actingAs($user)->postJson('/api/account-payables', [
        'supplier_id' => $supplier->id,
        'item' => 'Cel A17 ref PC Ambar',
        'description' => 'Conta manual no boleto',
        'amount' => 7200,
        'entry_date' => $entryDate,
        'due_date' => '2026-09-20',
        'payment_method' => 'boleto',
        'boleto_term_days' => 120,
        'status' => 'pending',
    ])->assertCreated();

    $payables = AccountPayable::query()
        ->where('company_id', $company->id)
        ->where('supplier_id', $supplier->id)
        ->where('item', 'Cel A17 ref PC Ambar')
        ->orderBy('installment_number')
        ->get();

    expect($payables)->toHaveCount(4)
        ->and($payables->every(fn (AccountPayable $payable): bool => $payable->purchase_id === null))->toBeTrue()
        ->and($payables->every(fn (AccountPayable $payable): bool => $payable->total_installments === 4))->toBeTrue()
        ->and($payables[0]->installment_number)->toBe(1)
        ->and($payables[0]->due_date?->toDateString())->toBe(Carbon::parse($entryDate)->addMonthsNoOverflow(1)->toDateString())
        ->and($payables[1]->installment_number)->toBe(2)
        ->and($payables[1]->due_date?->toDateString())->toBe(Carbon::parse($entryDate)->addMonthsNoOverflow(2)->toDateString())
        ->and($payables[2]->installment_number)->toBe(3)
        ->and($payables[2]->due_date?->toDateString())->toBe(Carbon::parse($entryDate)->addMonthsNoOverflow(3)->toDateString())
        ->and($payables[3]->installment_number)->toBe(4)
        ->and($payables[3]->due_date?->toDateString())->toBe(Carbon::parse($entryDate)->addMonthsNoOverflow(4)->toDateString());
});
