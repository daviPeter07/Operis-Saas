<?php

namespace App\Services\Finance;

use App\Enums\FinancialStatus;
use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ReceivableService
{
    public function __construct(private readonly AccountReceivableRepositoryInterface $receivables) {}

    public function regenerateFromSale(Sale $sale): void
    {
        $current = $this->receivables->forSale($sale);

        if ($current->contains(fn ($item): bool => $item->status === FinancialStatus::Received->value)) {
            throw ValidationException::withMessages([
                'sale' => 'Nao e permitido recalcular financeiro de venda com recebimento ja realizado.',
            ]);
        }

        foreach ($current as $receivable) {
            $receivable->delete();
        }

        $installments = $sale->installments ?? 1;
        $installmentAmount = $sale->total / $installments;
        $firstInstallmentDate = $sale->first_installment_date ?? $sale->date;

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
                'status' => FinancialStatus::Pending->value,
                'received_at' => null,
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
