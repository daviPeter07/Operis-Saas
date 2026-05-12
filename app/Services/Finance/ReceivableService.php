<?php

namespace App\Services\Finance;

use App\Enums\FinancialStatus;
use App\Enums\SaleStatus;
use App\Models\AccountReceivable;
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

        $crediarioEntry = $sale->payment_method === 'crediario'
            ? max(0, min((float) ($sale->crediario_entry ?? 0), (float) $sale->total))
            : 0.0;
        $financedTotal = max(0, (float) $sale->total - $crediarioEntry);
        $installments = $sale->installments ?? 1;
        $installmentAmount = $installments > 0
            ? $financedTotal / $installments
            : $financedTotal;
        $firstInstallmentDate = Carbon::parse($sale->first_installment_date ?? $sale->date)
            ->startOfDay();
        $isCompletedSale = $sale->status === SaleStatus::Completed->value;

        for ($i = 0; $i < $installments; $i++) {
            $dueDate = $firstInstallmentDate->copy()->addMonthsNoOverflow($i);

            $this->receivables->create([
                'company_id' => $sale->company_id,
                'customer_id' => $sale->customer_id,
                'sale_id' => $sale->id,
                'installment_number' => $i + 1,
                'entry_date' => $sale->date,
                'due_date' => $dueDate->toDateString(),
                'item' => $this->resolveSaleItemSummary($sale),
                'description' => null,
                'amount' => $installmentAmount,
                'status' => $isCompletedSale ? FinancialStatus::Received->value : FinancialStatus::Pending->value,
                'received_at' => $isCompletedSale ? now() : null,
            ]);
        }

        if ($crediarioEntry > 0) {
            $this->receivables->create([
                'company_id' => $sale->company_id,
                'customer_id' => $sale->customer_id,
                'sale_id' => $sale->id,
                'installment_number' => null,
                'entry_date' => $sale->date,
                'due_date' => $sale->date,
                'item' => 'Entrada',
                'description' => 'Entrada no crediario',
                'amount' => $crediarioEntry,
                'status' => FinancialStatus::Received->value,
                'received_at' => now(),
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
        return DB::transaction(function () use ($receivable, $data): AccountReceivable {
            if (in_array($receivable->status, [FinancialStatus::Received->value, FinancialStatus::Cancelled->value], true)) {
                throw ValidationException::withMessages([
                    'receivable' => 'Conta a receber ja foi baixada ou cancelada.',
                ]);
            }

            $receivable->update([
                'status' => FinancialStatus::Received->value,
                'received_at' => $data['received_at'],
            ]);

            $sale = Sale::query()
                ->with(['items:id,sale_id,product_id,quantity', 'receivables:id,sale_id,status'])
                ->find($receivable->sale_id);

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

            // Stock was already deducted on sale creation; no additional movement needed.

            return $receivable->refresh();
        });
    }

    public function unsettle(AccountReceivable $receivable, int $userId): AccountReceivable
    {
        return DB::transaction(function () use ($receivable): AccountReceivable {
            if ($receivable->status !== FinancialStatus::Received->value) {
                throw ValidationException::withMessages([
                    'receivable' => 'Conta a receber precisa estar baixada para desfazer a baixa.',
                ]);
            }

            $receivable->update([
                'status' => FinancialStatus::Pending->value,
                'received_at' => null,
            ]);

            $sale = Sale::query()
                ->with('receivables:id,sale_id,status')
                ->find($receivable->sale_id);

            if (! $sale) {
                return $receivable->refresh();
            }

            $hasOpenReceivables = $sale->receivables()
                ->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value])
                ->exists();

            $sale->update([
                'status' => $hasOpenReceivables
                    ? SaleStatus::Pending->value
                    : SaleStatus::Completed->value,
            ]);

            return $receivable->refresh();
        });
    }

    public function syncStatusesFromSales(?int $companyId = null): int
    {
        $updated = 0;

        $receivables = AccountReceivable::query()
            ->whereNotNull('sale_id')
            ->when($companyId !== null, fn ($query) => $query->where('company_id', $companyId))
            ->with('sale:id,status')
            ->get();

        foreach ($receivables as $receivable) {
            /** @var AccountReceivable $receivable */
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
