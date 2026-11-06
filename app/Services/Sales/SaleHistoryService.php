<?php

namespace App\Services\Sales;

use App\Enums\SaleEventType;
use App\Enums\SaleStatus;
use App\Models\AccountReceivable;
use App\Models\Sale;
use App\Models\SaleEvent;

/**
 * Writes the sale history (sale_events) and keeps completed_at / cancelled_at in step
 * with the sale status. Callers run inside their own DB transaction.
 */
class SaleHistoryService
{
    public function recordCreated(Sale $sale): void
    {
        $this->record($sale, SaleEventType::Created, 'Venda registrada', (float) $sale->total);
    }

    /**
     * Sets or clears delivered_at; marking the sale as delivered goes to the history.
     */
    public function syncDelivery(Sale $sale, bool $delivered): void
    {
        if ($delivered && $sale->delivered_at === null) {
            $sale->forceFill(['delivered_at' => now()])->save();
            $this->record($sale, SaleEventType::Delivered, 'Venda marcada como entregue', null);
        } elseif (! $delivered && $sale->delivered_at !== null) {
            $sale->forceFill(['delivered_at' => null])->save();
        }
    }

    public function recordUpdated(Sale $sale): void
    {
        $this->record($sale, SaleEventType::Updated, 'Venda editada', (float) $sale->total);
    }

    /**
     * Payments taken at the counter when the sale is saved: the crediário entry, or the
     * whole amount of a sale saved as completed (one event, even for card installments).
     */
    public function recordCheckoutPayments(Sale $sale, bool $includeEntry = true, bool $includeFullPayment = true): void
    {
        if ($sale->payment_method === 'crediario') {
            $entry = (float) $sale->crediario_entry;

            if ($includeEntry && $entry > 0) {
                $this->record($sale, SaleEventType::PaymentReceived, 'Entrada recebida', $entry);
            }

            return;
        }

        if ($includeFullPayment && $sale->status === SaleStatus::Completed->value && (float) $sale->total > 0) {
            $this->record($sale, SaleEventType::PaymentReceived, 'Pagamento recebido', (float) $sale->total);
        }
    }

    public function recordPayment(Sale $sale, AccountReceivable $receivable, float $amount, bool $partial = false): void
    {
        if ($amount <= 0) {
            return;
        }

        $installment = $this->installmentLabel($sale, $receivable);

        $description = match (true) {
            $installment === null => $partial ? 'Pagamento parcial recebido' : 'Pagamento recebido',
            $installment === 'entrada' => $partial ? 'Pagamento parcial da entrada recebido' : 'Entrada recebida',
            $partial => "Pagamento parcial da parcela {$installment} recebido",
            default => "Parcela {$installment} recebida",
        };

        $this->record($sale, SaleEventType::PaymentReceived, $description, $amount);
    }

    /**
     * Undoing a payment ("desfazer baixa"). The history has no own type for it, so it is
     * an `updated` event that says what was undone.
     */
    public function recordPaymentReversed(Sale $sale, AccountReceivable $receivable, float $amount): void
    {
        $installment = $this->installmentLabel($sale, $receivable);

        $description = match ($installment) {
            null => 'Recebimento desfeito',
            'entrada' => 'Recebimento da entrada desfeito',
            default => "Recebimento da parcela {$installment} desfeito",
        };

        $this->record($sale, SaleEventType::Updated, $description, $amount > 0 ? $amount : null);
    }

    /**
     * Compares the saved status with completed_at / cancelled_at, so it can run after any
     * number of status changes in one operation and still record each transition once.
     */
    public function syncStatus(Sale $sale): void
    {
        $sale->refresh();
        $changes = [];

        if ($sale->status === SaleStatus::Completed->value && $sale->completed_at === null) {
            $changes['completed_at'] = now();
            $this->record($sale, SaleEventType::Completed, 'Venda concluída', (float) $sale->total);
        } elseif ($sale->status !== SaleStatus::Completed->value && $sale->status !== SaleStatus::Cancelled->value && $sale->completed_at !== null) {
            // Back to pending (e.g. a payment was undone). A completed sale that gets
            // cancelled keeps the moment it was completed.
            $changes['completed_at'] = null;
        }

        if ($sale->status === SaleStatus::Cancelled->value && $sale->cancelled_at === null) {
            $changes['cancelled_at'] = now();
            $this->record($sale, SaleEventType::Cancelled, 'Venda cancelada', (float) $sale->total);
        } elseif ($sale->status !== SaleStatus::Cancelled->value && $sale->cancelled_at !== null) {
            $changes['cancelled_at'] = null;
        }

        if ($changes !== []) {
            $sale->forceFill($changes)->save();
        }
    }

    /**
     * 'entrada' for the crediário entry, the installment number when the sale is paid in
     * installments, or null for a single payment.
     */
    private function installmentLabel(Sale $sale, AccountReceivable $receivable): int|string|null
    {
        if ($receivable->installment_number === null) {
            return $sale->payment_method === 'crediario' ? 'entrada' : null;
        }

        if ($sale->payment_method === 'crediario' || (int) $sale->installments > 1) {
            return (int) $receivable->installment_number;
        }

        return null;
    }

    private function record(Sale $sale, SaleEventType $type, string $description, ?float $amount): void
    {
        SaleEvent::query()->create([
            'company_id' => $sale->company_id,
            'sale_id' => $sale->id,
            'type' => $type->value,
            'description' => $description,
            'amount' => $amount === null ? null : round($amount, 2),
            'occurred_at' => now(),
        ]);
    }
}
