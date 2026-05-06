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

        if ($current->contains(fn (AccountPayable $item): bool => $item->status === 'paid')) {
            throw ValidationException::withMessages([
                'purchase' => 'Nao e permitido recalcular financeiro de compra com pagamento ja realizado.',
            ]);
        }

        foreach ($current as $payable) {
            $payable->delete();
        }

        $isImmediatePayment = $purchase->payment_method === 'cash';
        $dueDate = $purchase->payment_method === 'boleto'
            ? $purchase->date?->copy()->addDays((int) ($purchase->boleto_term_days ?? 30))->toDateString()
            : ($purchase->due_date?->toDateString() ?? $purchase->date?->toDateString());

        $this->payables->create([
            'company_id' => $purchase->company_id,
            'purchase_id' => $purchase->id,
            'installment_number' => 1,
            'due_date' => $dueDate,
            'amount' => $purchase->total,
            'status' => $isImmediatePayment ? 'paid' : 'pending',
            'paid_at' => $isImmediatePayment ? now() : null,
            'paid_method' => $isImmediatePayment ? 'cash' : null,
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
}
