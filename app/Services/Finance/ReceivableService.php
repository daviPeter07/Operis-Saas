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

        $installments = $sale->installments ?? 1;
        $installmentAmount = $sale->total / $installments;
        $firstInstallmentDate = $sale->first_installment_date ?? $sale->date;

        for ($i = 0; $i < $installments; $i++) {
            $dueDate = (new \DateTime($firstInstallmentDate))->modify("+{$i} month");

            $this->receivables->create([
                'company_id' => $sale->company_id,
                'sale_id' => $sale->id,
                'installment_number' => $i + 1,
                'due_date' => $dueDate->format('Y-m-d'),
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
}
