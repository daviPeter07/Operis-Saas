<?php

namespace App\Services\Finance;

use App\Enums\PurchaseStatus;
use App\Enums\StockMovementType;
use App\Models\AccountPayable;
use App\Models\Product;
use App\Models\Purchase;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use App\Services\Products\StockMovementService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayableService
{
    public function __construct(
        private readonly AccountPayableRepositoryInterface $payables,
        private readonly StockMovementService $stockMovementService,
    ) {}

    public function regenerateFromPurchase(Purchase $purchase): void
    {
        $current = $this->payables->forPurchase($purchase);

        foreach ($current as $payable) {
            $payable->delete();
        }

        $isPaid = $purchase->status === PurchaseStatus::Completed->value || $purchase->payment_method === 'cash';

        if ($purchase->payment_method === 'boleto') {
            $termDays = max(30, (int) ($purchase->boleto_term_days ?? 30));
            $installments = max(1, (int) floor($termDays / 30));
            $baseDate = $purchase->date?->copy() ?? now();
            $totalCents = (int) round((float) $purchase->total * 100);
            $baseInstallmentCents = intdiv($totalCents, $installments);
            $remainderCents = $totalCents % $installments;

            for ($index = 1; $index <= $installments; $index++) {
                $currentCents = $baseInstallmentCents + ($index <= $remainderCents ? 1 : 0);
                $dueDate = $baseDate->copy()->addDays(30 * $index)->toDateString();

                $this->payables->create([
                    'company_id' => $purchase->company_id,
                    'purchase_id' => $purchase->id,
                    'installment_number' => $index,
                    'due_date' => $dueDate,
                    'amount' => $currentCents / 100,
                    'status' => $isPaid ? 'paid' : 'pending',
                    'paid_at' => $isPaid ? now() : null,
                    'paid_method' => $isPaid ? $purchase->payment_method : null,
                ]);
            }

            return;
        }

        $dueDate = $purchase->due_date?->toDateString() ?? $purchase->date?->toDateString();

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

    public function settle(AccountPayable $payable, int $userId, array $data): AccountPayable
    {
        return DB::transaction(function () use ($payable, $userId, $data): AccountPayable {
            if (in_array($payable->status, ['paid', 'cancelled'], true)) {
                throw ValidationException::withMessages([
                    'payable' => 'Conta a pagar ja foi liquidada ou cancelada.',
                ]);
            }

            $payable->update([
                'status' => 'paid',
                'paid_at' => $data['paid_at'],
                'paid_method' => $data['paid_method'],
                'payment_notes' => $data['payment_notes'] ?? null,
            ]);

            $purchase = $payable->purchase()
                ->with('items:id,purchase_id,product_id,quantity')
                ->first();

            if (! $purchase || $purchase->status !== PurchaseStatus::Pending->value) {
                return $payable->refresh();
            }

            $hasOpenPayables = $purchase->payables()->where('status', 'pending')->exists();

            if ($hasOpenPayables) {
                return $payable->refresh();
            }

            $purchase->update(['status' => PurchaseStatus::Completed->value]);

            foreach ($purchase->items as $item) {
                $product = Product::query()->findOrFail($item->product_id);

                $this->stockMovementService->register(
                    $product,
                    (float) $item->quantity,
                    StockMovementType::PurchaseEdit,
                    $purchase->id,
                    $userId,
                    'purchase'
                );
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
