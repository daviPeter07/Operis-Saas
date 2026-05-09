<?php

namespace App\Services\Finance;

use App\Enums\FinancialStatus;
use App\Enums\SaleStatus;
use App\Enums\StockMovementType;
use App\Models\AccountReceivable;
use App\Models\Product;
use App\Models\Sale;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use App\Services\Products\StockMovementService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReceivableService
{
    public function __construct(
        private readonly AccountReceivableRepositoryInterface $receivables,
        private readonly StockMovementService $stockMovementService,
    ) {}

    public function regenerateFromSale(Sale $sale): void
    {
        $current = $this->receivables->forSale($sale);

        foreach ($current as $receivable) {
            $receivable->delete();
        }

        $installments = $sale->installments ?? 1;
        $installmentAmount = $sale->total / $installments;
        $firstInstallmentDate = $sale->first_installment_date ?? $sale->date;
        $isCompletedSale = $sale->status === SaleStatus::Completed->value;

        for ($i = 0; $i < $installments; $i++) {
            $dueDate = (new \DateTime($firstInstallmentDate))->modify("+{$i} month");

            $this->receivables->create([
                'company_id' => $sale->company_id,
                'customer_id' => $sale->customer_id,
                'sale_id' => $sale->id,
                'installment_number' => $i + 1,
                'entry_date' => $sale->date,
                'due_date' => $dueDate->format('Y-m-d'),
                'item' => $this->resolveSaleItemSummary($sale),
                'description' => null,
                'amount' => $installmentAmount,
                'status' => $isCompletedSale ? FinancialStatus::Received->value : FinancialStatus::Pending->value,
                'received_at' => $isCompletedSale ? now() : null,
            ]);
        }
    }

    public function cancelFromSale(Sale $sale): void
    {
        $current = $this->receivables->forSale($sale);

        foreach ($current as $receivable) {
            $receivable->update([
                'status' => FinancialStatus::Cancelled->value,
            ]);
        }
    }

    public function syncMissingForCompany(int $companyId): void
    {
        Sale::query()
            ->where('company_id', $companyId)
            ->whereIn('status', [SaleStatus::Pending->value, SaleStatus::Completed->value])
            ->doesntHave('receivables')
            ->get()
            ->each(fn (Sale $sale) => $this->regenerateFromSale($sale));
    }

    public function createManual(int $companyId, array $data): void
    {
        $this->receivables->create([
            'company_id' => $companyId,
            'customer_id' => $data['customer_id'],
            'sale_id' => null,
            'installment_number' => null,
            'entry_date' => $data['entry_date'],
            'due_date' => null,
            'item' => $data['item'],
            'description' => $data['description'] ?? null,
            'amount' => $data['amount'],
            'status' => FinancialStatus::Pending->value,
            'received_at' => null,
        ]);
    }

    public function customerOpenBalance(int $companyId, int $customerId): float
    {
        return $this->receivables->openBalanceForCustomer($companyId, $customerId);
    }

    public function settle(AccountReceivable $receivable, int $userId, array $data): AccountReceivable
    {
        return DB::transaction(function () use ($receivable, $userId, $data): AccountReceivable {
            if (in_array($receivable->status, [FinancialStatus::Received->value, FinancialStatus::Cancelled->value], true)) {
                throw ValidationException::withMessages([
                    'receivable' => 'Conta a receber ja foi baixada ou cancelada.',
                ]);
            }

            $receivable->update([
                'status' => FinancialStatus::Received->value,
                'received_at' => $data['received_at'],
            ]);

            $sale = $receivable->sale()
                ->with('items:id,sale_id,product_id,quantity')
                ->first();

            if (! $sale || $sale->status !== SaleStatus::Pending->value) {
                return $receivable->refresh();
            }

            $hasOpenReceivables = $sale->receivables()
                ->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value])
                ->exists();

            if ($hasOpenReceivables) {
                return $receivable->refresh();
            }

            $sale->update(['status' => SaleStatus::Completed->value]);

            foreach ($sale->items as $item) {
                $product = Product::query()->findOrFail($item->product_id);

                $this->stockMovementService->register(
                    $product,
                    -(float) $item->quantity,
                    StockMovementType::SaleEdit,
                    $sale->id,
                    $userId,
                );
            }

            return $receivable->refresh();
        });
    }

    public function syncStatusesFromSales(?int $companyId = null): int
    {
        $updated = 0;

        AccountReceivable::query()
            ->whereNotNull('sale_id')
            ->when($companyId !== null, fn ($query) => $query->where('company_id', $companyId))
            ->with('sale:id,status')
            ->chunkById(200, function ($receivables) use (&$updated): void {
                foreach ($receivables as $receivable) {
                    $saleStatus = $receivable->sale?->status;

                    if ($saleStatus === null) {
                        continue;
                    }

                    $targetStatus = match ($saleStatus) {
                        SaleStatus::Completed->value => FinancialStatus::Received->value,
                        SaleStatus::Cancelled->value => FinancialStatus::Cancelled->value,
                        default => FinancialStatus::Pending->value,
                    };

                    if ($receivable->status === $targetStatus) {
                        continue;
                    }

                    $receivable->update([
                        'status' => $targetStatus,
                        'received_at' => $targetStatus === FinancialStatus::Received->value
                            ? ($receivable->received_at ?? now())
                            : null,
                    ]);

                    $updated++;
                }
            });

        return $updated;
    }

    public function resolveCrediarioDueDate(string $date, int $termDays): string
    {
        return Carbon::parse($date)->addDays(max(1, $termDays))->toDateString();
    }

    private function resolveSaleItemSummary(Sale $sale): ?string
    {
        $items = $sale->items()
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
}
