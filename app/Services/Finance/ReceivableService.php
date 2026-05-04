<?php

namespace App\Services\Finance;

use App\Enums\FinancialStatus;
use App\Models\Sale;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
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

        $this->receivables->create([
            'company_id' => $sale->company_id,
            'sale_id' => $sale->id,
            'installment_number' => 1,
            'due_date' => $sale->date,
            'amount' => $sale->total,
            'status' => $sale->payment_method === 'cash' ? FinancialStatus::Received->value : FinancialStatus::Pending->value,
            'received_at' => $sale->payment_method === 'cash' ? now() : null,
        ]);
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
}
