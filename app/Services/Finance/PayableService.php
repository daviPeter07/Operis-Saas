<?php

namespace App\Services\Finance;

use App\Enums\PurchaseStatus;
use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayableService
{
    public function __construct(
        private readonly AccountPayableRepositoryInterface $payables,
    ) {}

    public function regenerateFromPurchase(Purchase $purchase): void
    {
        $current = $this->payables->forPurchase($purchase);

        foreach ($current as $payable) {
            $payable->delete();
        }

        $isPaid = $purchase->status === PurchaseStatus::Completed->value || $purchase->payment_method === 'cash';

        if ($purchase->payment_method === 'boleto') {
            // Determine number of installments based on boleto term days (30 days per installment)
            $termDays = $purchase->boleto_term_days ?? 60; // default 60 days → 2 installments
            $installments = (int) ceil($termDays / 30);
            // Parse the stored date as a local date in America/Sao_Paulo without shifting the day
            $baseDate = Carbon::parse((string) $purchase->date, 'America/Sao_Paulo')->startOfDay();
            $totalCents = (int) round((float) $purchase->total * 100);
            $baseInstallmentCents = intdiv($totalCents, $installments);
            $remainderCents = $totalCents % $installments;

            for ($index = 1; $index <= $installments; $index++) {
                $currentCents = $baseInstallmentCents + ($index <= $remainderCents ? 1 : 0);
                $dueDate = $baseDate->copy()->addDays(30 * $index)->toDateString();

                $this->payables->create([
                    'company_id' => $purchase->company_id,
                    'supplier_id' => $purchase->supplier_id,
                    'purchase_id' => $purchase->id,
                    'installment_number' => $index,
                    'total_installments' => $installments,
                    'entry_date' => $purchase->date,
                    'item' => $this->resolvePurchaseItemSummary($purchase),
                    'description' => sprintf('Compra #%d - Parcela %d/%d (boleto)', $purchase->id, $index, $installments),
                    'due_date' => $dueDate,
                    'amount' => $currentCents / 100,
                    'amount_paid' => $isPaid ? ($currentCents / 100) : 0,
                    'status' => $isPaid ? 'paid' : 'pending',
                    'paid_at' => $isPaid ? now() : null,
                    'paid_method' => $isPaid ? $purchase->payment_method : null,
                ]);
            }

            return;
        }

        $dueDate = Carbon::parse((string) ($purchase->due_date ?? $purchase->date))->toDateString();

        $this->payables->create([
            'company_id' => $purchase->company_id,
            'supplier_id' => $purchase->supplier_id,
            'purchase_id' => $purchase->id,
            'installment_number' => 1,
            'total_installments' => null,
            'entry_date' => $purchase->date,
            'item' => $this->resolvePurchaseItemSummary($purchase),
            'description' => sprintf('Compra #%d', $purchase->id),
            'due_date' => $dueDate,
            'amount' => $purchase->total,
            'amount_paid' => $isPaid ? $purchase->total : 0,
            'status' => $isPaid ? 'paid' : 'pending',
            'paid_at' => $isPaid ? now() : null,
            'paid_method' => $isPaid ? $purchase->payment_method : null,
        ]);
    }

    public function cancelFromPurchase(Purchase $purchase): void
    {
        foreach ($this->payables->forPurchase($purchase) as $payable) {
            $payable->update(['status' => 'cancelled']);
        }
    }

    public function createManual(int $companyId, array $data): void
    {
        $isPaid = ($data['status'] ?? 'pending') === 'paid';
        $paymentMethod = $data['payment_method'] ?? 'pix';
        $boletoTermDays = $data['boleto_term_days'] ?? null;

        if ($paymentMethod === 'boleto') {
            $installments = 2;
            $entryDate = $data['entry_date'];
            $totalCents = (int) round((float) $data['amount'] * 100);
            $baseInstallmentCents = intdiv($totalCents, $installments);
            $remainderCents = $totalCents % $installments;

            $baseDateObj = Carbon::parse($entryDate, 'America/Sao_Paulo');

            for ($index = 1; $index <= $installments; $index++) {
                $currentCents = $baseInstallmentCents + ($index <= $remainderCents ? 1 : 0);
                $dueDate = $baseDateObj->copy()->addDays(30 * $index)->toDateString();

                $this->payables->create([
                    'company_id' => $companyId,
                    'supplier_id' => $data['supplier_id'],
                    'purchase_id' => null,
                    'installment_number' => $index,
                    'total_installments' => $installments,
                    'entry_date' => $entryDate,
                    'item' => $data['item'],
                    'description' => $data['description'] ?? null,
                    'due_date' => $dueDate,
                    'amount' => $currentCents / 100,
                    'amount_paid' => $isPaid ? ($currentCents / 100) : 0,
                    'status' => $isPaid ? 'paid' : 'pending',
                    'paid_at' => $isPaid ? $entryDate : null,
                    'paid_method' => $paymentMethod,
                    'payment_notes' => $data['description'] ?? null,
                ]);
            }

            return;
        }

        $this->payables->create([
            'company_id' => $companyId,
            'supplier_id' => $data['supplier_id'],
            'purchase_id' => null,
            'installment_number' => 1,
            'entry_date' => $data['entry_date'],
            'item' => $data['item'],
            'description' => $data['description'] ?? null,
            'due_date' => $data['due_date'],
            'amount' => $data['amount'],
            'amount_paid' => $isPaid ? $data['amount'] : 0,
            'status' => $isPaid ? 'paid' : 'pending',
            'paid_at' => $isPaid ? ($data['entry_date']) : null,
            'paid_method' => $paymentMethod,
            'payment_notes' => $data['description'] ?? null,
        ]);
    }

    public function update(AccountPayable $payable, array $data): AccountPayable
    {
        $payable->update([
            'supplier_id' => $data['supplier_id'],
            'entry_date' => $data['entry_date'],
            'due_date' => $data['due_date'],
            'item' => $data['item'],
            'description' => $data['description'] ?? null,
            'amount' => $data['amount'],
        ]);

        return $payable->refresh();
    }

    public function settle(AccountPayable $payable, int $userId, array $data): AccountPayable
    {
        return DB::transaction(function () use ($payable, $data): AccountPayable {
            if (in_array($payable->status, ['paid', 'cancelled'], true)) {
                throw ValidationException::withMessages([
                    'payable' => 'Conta a pagar ja foi liquidada ou cancelada.',
                ]);
            }

            $payable->update([
                'status' => 'paid',
                'amount_paid' => $payable->amount,
                'paid_at' => $data['paid_at'],
                'paid_method' => $data['paid_method'],
                'payment_notes' => $data['payment_notes'] ?? null,
            ]);

            $purchase = Purchase::query()
                ->with(['payables:id,purchase_id,status'])
                ->find($payable->purchase_id);

            if (! $purchase || $purchase->status !== PurchaseStatus::Pending->value) {
                return $payable->refresh();
            }

            $hasOpenPayables = $purchase->payables()->whereIn('status', ['pending', 'partial'])->exists();

            if ($hasOpenPayables) {
                return $payable->refresh();
            }

            $purchase->update(['status' => PurchaseStatus::Completed->value]);

            return $payable->refresh();
        });
    }

    public function unsettle(AccountPayable $payable, int $userId): AccountPayable
    {
        return DB::transaction(function () use ($payable): AccountPayable {
            if ($payable->status !== 'paid') {
                throw ValidationException::withMessages([
                    'payable' => 'Conta a pagar precisa estar paga para desfazer a baixa.',
                ]);
            }

            $payable->update([
                'status' => 'pending',
                'amount_paid' => 0,
                'paid_at' => null,
                'paid_method' => null,
                'payment_notes' => null,
            ]);

            $purchase = Purchase::query()
                ->with(['payables:id,purchase_id,status'])
                ->find($payable->purchase_id);

            if (! $purchase) {
                return $payable->refresh();
            }

            $hasOpenPayables = $purchase->payables()->whereIn('status', ['pending', 'partial'])->exists();

            if ($purchase->status === PurchaseStatus::Completed->value && $hasOpenPayables) {
                $purchase->update(['status' => PurchaseStatus::Pending->value]);
            }

            return $payable->refresh();
        });
    }

    public function syncMissingForCompany(int $companyId): void
    {
        Purchase::query()
            ->where('company_id', $companyId)
            ->whereIn('status', [PurchaseStatus::Pending->value, PurchaseStatus::Completed->value])
            ->doesntHave('payables')
            ->get()
            ->each(fn (Purchase $purchase) => $this->regenerateFromPurchase($purchase));
    }

    public function syncStatusesFromPurchases(?int $companyId = null): int
    {
        $updated = 0;

        $payables = AccountPayable::query()
            ->whereNotNull('purchase_id')
            ->when($companyId !== null, fn ($query) => $query->where('company_id', $companyId))
            ->with('purchase:id,status,payment_method')
            ->get();

        foreach ($payables as $payable) {
            /** @var AccountPayable $payable */
            $purchaseStatus = $payable->purchase?->status;

            if ($purchaseStatus === null) {
                continue;
            }

            $targetStatus = match ($purchaseStatus) {
                PurchaseStatus::Completed->value => 'paid',
                PurchaseStatus::Cancelled->value => 'cancelled',
                default => null,
            };

            if ($targetStatus === null) {
                continue;
            }

            if ($payable->status === $targetStatus) {
                continue;
            }

            $payable->update([
                'status' => $targetStatus,
                'amount_paid' => $targetStatus === 'paid' ? $payable->amount : $payable->amount_paid,
                'paid_at' => $targetStatus === 'paid' ? ($payable->paid_at ?? now()) : null,
                'paid_method' => $targetStatus === 'paid' ? ($payable->paid_method ?? $payable->purchase?->payment_method) : null,
            ]);

            $updated++;
        }

        return $updated;
    }

    private function resolvePurchaseItemSummary(Purchase $purchase): ?string
    {
        $items = $purchase->items()
            ->with('product')
            ->get()
            ->pluck('product.name')
            ->filter()
            ->unique()
            ->values();

        if ($items->isEmpty()) {
            return null;
        }

        if ($items->count() === 1) {
            return $items->first();
        }

        return sprintf('%s +%d item(ns)', $items->first(), $items->count() - 1);
    }

    public function settlePartial(AccountPayable $payable, int $userId, array $data): AccountPayable
    {
        return DB::transaction(function () use ($payable, $data): AccountPayable {
            if ($payable->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'payable' => 'Conta a pagar cancelada nao pode receber pagamento parcial.',
                ]);
            }

            $remaining = max(0, (float) $payable->amount - (float) ($payable->amount_paid ?? 0));
            $amount = (float) $data['amount'];

            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Conta a pagar ja esta totalmente quitada.',
                ]);
            }

            if ($amount > $remaining) {
                throw ValidationException::withMessages([
                    'amount' => 'Valor informado excede o saldo restante da conta.',
                ]);
            }

            $newAmountPaid = min((float) $payable->amount, (float) ($payable->amount_paid ?? 0) + $amount);
            $isFullySettled = round($newAmountPaid, 2) >= round((float) $payable->amount, 2);

            $payable->update([
                'amount_paid' => $newAmountPaid,
                'status' => $isFullySettled ? 'paid' : 'partial',
                'paid_at' => $data['paid_at'],
                'paid_method' => $data['paid_method'],
                'payment_notes' => $data['payment_notes'] ?? $payable->payment_notes,
            ]);

            if (! $payable->purchase_id) {
                return $payable->refresh();
            }

            $purchase = Purchase::query()
                ->with(['payables:id,purchase_id,status'])
                ->find($payable->purchase_id);

            if (! $purchase) {
                return $payable->refresh();
            }

            $hasOpenPayables = $purchase->payables()
                ->whereIn('status', ['pending', 'partial'])
                ->exists();

            $purchase->update([
                'status' => $hasOpenPayables
                    ? PurchaseStatus::Pending->value
                    : PurchaseStatus::Completed->value,
            ]);

            return $payable->refresh();
        });
    }
}
