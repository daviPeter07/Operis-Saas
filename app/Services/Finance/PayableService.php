<?php

namespace App\Services\Finance;

use App\Enums\PurchaseStatus;
use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use Illuminate\Validation\ValidationException;

class PayableService
{
    public function __construct(private readonly AccountPayableRepositoryInterface $payables) {}

    public function regenerateFromPurchase(Purchase $purchase): void
    {
        $current = $this->payables->forPurchase($purchase);

        foreach ($current as $payable) {
            $payable->delete();
        }

        $isPaid = $purchase->status === PurchaseStatus::Completed->value || $purchase->payment_method === 'cash';
        $dueDate = $purchase->payment_method === 'boleto'
            ? $purchase->date?->copy()->addDays((int) ($purchase->boleto_term_days ?? 30))->toDateString()
            : ($purchase->due_date?->toDateString() ?? $purchase->date?->toDateString());

        $this->payables->create([
            'company_id' => $purchase->company_id,
            'purchase_id' => $purchase->id,
            'installment_number' => 1,
            'due_date' => $dueDate,
            'amount' => $purchase->total,
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

    public function settle(AccountPayable $payable, array $data): AccountPayable
    {
        if (in_array($payable->status, ['paid', 'cancelled'], true)) {
            throw ValidationException::withMessages([
                'payable' => 'Conta a pagar já foi liquidada ou cancelada.',
            ]);
        }

        $payable->update([
            'status' => 'paid',
            'paid_at' => $data['paid_at'],
            'paid_method' => $data['paid_method'],
            'payment_notes' => $data['payment_notes'] ?? null,
        ]);

        return $payable->refresh();
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

        AccountPayable::query()
            ->whereNotNull('purchase_id')
            ->when($companyId !== null, fn ($query) => $query->where('company_id', $companyId))
            ->with('purchase:id,status,payment_method')
            ->chunkById(200, function ($payables) use (&$updated): void {
                foreach ($payables as $payable) {
                    $purchaseStatus = $payable->purchase?->status;

                    if ($purchaseStatus === null) {
                        continue;
                    }

                    $targetStatus = match ($purchaseStatus) {
                        PurchaseStatus::Completed->value => 'paid',
                        PurchaseStatus::Cancelled->value => 'cancelled',
                        default => 'pending',
                    };

                    if ($payable->status === $targetStatus) {
                        continue;
                    }

                    $payable->update([
                        'status' => $targetStatus,
                        'paid_at' => $targetStatus === 'paid' ? ($payable->paid_at ?? now()) : null,
                        'paid_method' => $targetStatus === 'paid' ? ($payable->paid_method ?? $payable->purchase?->payment_method) : null,
                    ]);

                    $updated++;
                }
            });

        return $updated;
    }
}
