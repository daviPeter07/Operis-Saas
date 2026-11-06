<?php

namespace App\Services\Purchases;

use App\Enums\PurchaseEventType;
use App\Enums\PurchaseStatus;
use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Models\PurchaseEvent;

/**
 * Writes the purchase history (purchase_events) and keeps completed_at / cancelled_at in step
 * with the purchase status. Same shape as the sale history. Callers run inside their own
 * DB transaction.
 */
class PurchaseHistoryService
{
    public function recordCreated(Purchase $purchase): void
    {
        $this->record($purchase, PurchaseEventType::Created, 'Compra registrada', (float) $purchase->total);
    }

    public function recordUpdated(Purchase $purchase): void
    {
        $this->record($purchase, PurchaseEventType::Updated, 'Compra editada', (float) $purchase->total);
    }

    /**
     * What each payable of the purchase has paid, keyed by boleto number (or "single").
     * Payables are rebuilt on some edits, so they are matched by number, not by id.
     *
     * @return array<string, float>
     */
    public function paidSnapshot(Purchase $purchase): array
    {
        return $purchase->payables()
            ->where('status', '!=', 'cancelled')
            ->get()
            ->mapWithKeys(fn (AccountPayable $payable): array => [
                $this->snapshotKey($payable) => round((float) $payable->amount_paid, 2),
            ])
            ->all();
    }

    /**
     * Payments made or undone while saving the purchase (cash, a purchase saved as paid,
     * boletos marked as paid on the summary), compared with what was paid before.
     *
     * @param  array<string, float>  $paidBefore  From paidSnapshot() before the change.
     */
    public function recordPaymentChanges(Purchase $purchase, array $paidBefore): void
    {
        $payables = $purchase->payables()
            ->where('status', '!=', 'cancelled')
            ->orderBy('installment_number')
            ->get();
        $paidNow = [];

        foreach ($payables as $payable) {
            $key = $this->snapshotKey($payable);
            $paid = round((float) $payable->amount_paid, 2);
            $before = $paidBefore[$key] ?? 0.0;
            $paidNow[$key] = $paid;

            if ($paid > $before) {
                $this->recordPayment($purchase, $payable, $paid - $before, partial: $payable->status === 'partial');
            } elseif ($paid < $before) {
                $this->recordPaymentReversed($purchase, $payable, $before - $paid);
            }
        }

        foreach ($paidBefore as $key => $before) {
            if (! array_key_exists($key, $paidNow) && $before > 0) {
                $this->record($purchase, PurchaseEventType::Updated, $this->reversedDescription($purchase, $key === 'single' ? null : (int) $key), $before);
            }
        }
    }

    public function recordPayment(Purchase $purchase, AccountPayable $payable, float $amount, bool $partial = false): void
    {
        if ($amount <= 0) {
            return;
        }

        $boleto = $this->boletoNumber($purchase, $payable);

        $description = match (true) {
            $boleto === null => $partial ? 'Pagamento parcial feito' : 'Pagamento feito',
            $partial => "Pagamento parcial do boleto {$boleto}",
            default => "Boleto {$boleto} pago",
        };

        $this->record($purchase, PurchaseEventType::PaymentMade, $description, $amount);
    }

    /**
     * Undoing a payment ("desfazer baixa"). There is no own type for it, so it is an
     * `updated` event that says what was undone.
     */
    public function recordPaymentReversed(Purchase $purchase, AccountPayable $payable, float $amount): void
    {
        $this->record(
            $purchase,
            PurchaseEventType::Updated,
            $this->reversedDescription($purchase, $this->boletoNumber($purchase, $payable)),
            $amount > 0 ? $amount : null,
        );
    }

    /**
     * Compares the saved status with completed_at / cancelled_at, so it can run after any
     * number of status changes in one operation and still record each transition once.
     */
    public function syncStatus(Purchase $purchase): void
    {
        $purchase->refresh();
        $changes = [];

        if ($purchase->status === PurchaseStatus::Completed->value && $purchase->completed_at === null) {
            $changes['completed_at'] = now();
            $this->record($purchase, PurchaseEventType::Completed, 'Compra concluída', (float) $purchase->total);
        } elseif ($purchase->status === PurchaseStatus::Pending->value && $purchase->completed_at !== null) {
            // Back to pending (e.g. a payment was undone). A completed purchase that gets
            // cancelled keeps the moment it was completed.
            $changes['completed_at'] = null;
        }

        if ($purchase->status === PurchaseStatus::Cancelled->value && $purchase->cancelled_at === null) {
            $changes['cancelled_at'] = now();
            $this->record($purchase, PurchaseEventType::Cancelled, 'Compra cancelada', (float) $purchase->total);
        } elseif ($purchase->status !== PurchaseStatus::Cancelled->value && $purchase->cancelled_at !== null) {
            $changes['cancelled_at'] = null;
        }

        if ($changes !== []) {
            $purchase->forceFill($changes)->save();
        }
    }

    private function snapshotKey(AccountPayable $payable): string
    {
        return $payable->installment_number === null ? 'single' : (string) $payable->installment_number;
    }

    /**
     * The boleto number when the purchase is paid in boletos, or null for a single payment.
     */
    private function boletoNumber(Purchase $purchase, AccountPayable $payable): ?int
    {
        if ($purchase->payment_method !== 'boleto' || $payable->installment_number === null) {
            return null;
        }

        return (int) $payable->installment_number;
    }

    private function reversedDescription(Purchase $purchase, ?int $boleto): string
    {
        return $purchase->payment_method === 'boleto' && $boleto !== null
            ? "Pagamento do boleto {$boleto} desfeito"
            : 'Pagamento desfeito';
    }

    private function record(Purchase $purchase, PurchaseEventType $type, string $description, ?float $amount): void
    {
        PurchaseEvent::query()->create([
            'company_id' => $purchase->company_id,
            'purchase_id' => $purchase->id,
            'type' => $type->value,
            'description' => $description,
            'amount' => $amount === null ? null : round($amount, 2),
            'occurred_at' => now(),
        ]);
    }
}
