<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Builds the history of purchases saved before purchase_events existed, from what the
 * database has:
 * - "Compra registrada" at the purchase's created_at;
 * - one event per paid (or partly paid) payable at its paid_at: "Boleto n pago" for boletos,
 *   "Pagamento feito" otherwise;
 * - completed purchases: completed_at = the last payment (or updated_at when there is none);
 * - cancelled purchases: cancelled_at = updated_at (the cancel is the purchase's last change).
 *
 * Only purchases without any event are touched and completed_at / cancelled_at are only
 * filled when empty, so running it again changes nothing. Event times never come before the
 * purchase's creation.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('purchases')
            ->whereNotExists(fn ($events) => $events->selectRaw('1')->from('purchase_events')->whereColumn('purchase_events.purchase_id', 'purchases.id'))
            ->select(['id', 'company_id', 'status', 'payment_method', 'total', 'date', 'completed_at', 'cancelled_at', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->chunkById(200, function (Collection $purchases): void {
                $payables = DB::table('account_payables')
                    ->whereIn('purchase_id', $purchases->pluck('id'))
                    ->where('amount_paid', '>', 0)
                    ->orderBy('installment_number')
                    ->get(['purchase_id', 'installment_number', 'total_installments', 'amount_paid', 'status', 'paid_at'])
                    ->groupBy('purchase_id');

                DB::transaction(function () use ($purchases, $payables): void {
                    foreach ($purchases as $purchase) {
                        $this->backfillPurchase($purchase, $payables->get($purchase->id, collect()));
                    }
                });
            });
    }

    public function down(): void
    {
        // The events and columns are dropped by the migrations that created them.
    }

    private function backfillPurchase(object $purchase, Collection $payments): void
    {
        $createdAt = $purchase->created_at !== null
            ? Carbon::parse($purchase->created_at, 'UTC')
            : Carbon::parse($purchase->date, config('app.business_timezone'))->setTime(12, 0)->utc();
        $updatedAt = $purchase->updated_at !== null ? Carbon::parse($purchase->updated_at, 'UTC') : $createdAt;
        $notBeforeCreation = fn (Carbon $moment): Carbon => $moment->lessThan($createdAt) ? $createdAt->copy() : $moment;

        $events = [$this->event($purchase, 'created', 'Compra registrada', (float) $purchase->total, $createdAt)];
        $lastPaymentAt = null;

        $rows = $payments
            ->map(fn (object $payable): array => [
                'payable' => $payable,
                'at' => $notBeforeCreation($this->paidAt($payable->paid_at, $createdAt)),
            ])
            ->sortBy(fn (array $row): int => $row['at']->getTimestamp());

        foreach ($rows as $row) {
            $payable = $row['payable'];
            $events[] = $this->event($purchase, 'payment_made', $this->paymentDescription($purchase, $payable), (float) $payable->amount_paid, $row['at']);
            $lastPaymentAt = $lastPaymentAt === null || $row['at']->greaterThan($lastPaymentAt) ? $row['at'] : $lastPaymentAt;
        }

        $changes = [];

        if ($purchase->status === 'completed') {
            $completedAt = $purchase->completed_at !== null
                ? Carbon::parse($purchase->completed_at, 'UTC')
                : ($lastPaymentAt ?? $notBeforeCreation($updatedAt));
            $events[] = $this->event($purchase, 'completed', 'Compra concluída', (float) $purchase->total, $completedAt);

            if ($purchase->completed_at === null) {
                $changes['completed_at'] = $completedAt->toDateTimeString();
            }
        }

        if ($purchase->status === 'cancelled') {
            $cancelledAt = $purchase->cancelled_at !== null
                ? Carbon::parse($purchase->cancelled_at, 'UTC')
                : $notBeforeCreation($updatedAt);
            $events[] = $this->event($purchase, 'cancelled', 'Compra cancelada', (float) $purchase->total, $cancelledAt);

            if ($purchase->cancelled_at === null) {
                $changes['cancelled_at'] = $cancelledAt->toDateTimeString();
            }
        }

        DB::table('purchase_events')->insert($events);

        if ($changes !== []) {
            // Keeps updated_at as it was: it is part of the purchase's own record.
            DB::table('purchases')->where('id', $purchase->id)->update($changes);
        }
    }

    /**
     * Payments settled from the payables screen stored only the chosen day (midnight).
     * That day is a Manaus calendar day, so midnight is read in the business timezone.
     */
    private function paidAt(?string $paidAt, Carbon $fallback): Carbon
    {
        if ($paidAt === null) {
            return $fallback->copy();
        }

        $moment = Carbon::parse($paidAt, 'UTC');

        return $moment->format('H:i:s') === '00:00:00'
            ? Carbon::parse($moment->toDateString(), config('app.business_timezone'))->utc()
            : $moment;
    }

    private function paymentDescription(object $purchase, object $payable): string
    {
        $partial = $payable->status === 'partial';

        if ($purchase->payment_method === 'boleto' && $payable->installment_number !== null) {
            return $partial
                ? "Pagamento parcial do boleto {$payable->installment_number}"
                : "Boleto {$payable->installment_number} pago";
        }

        return $partial ? 'Pagamento parcial feito' : 'Pagamento feito';
    }

    /**
     * @return array<string, mixed>
     */
    private function event(object $purchase, string $type, string $description, ?float $amount, Carbon $occurredAt): array
    {
        $now = now()->toDateTimeString();

        return [
            'company_id' => $purchase->company_id,
            'purchase_id' => $purchase->id,
            'type' => $type,
            'description' => $description,
            'amount' => $amount === null ? null : round($amount, 2),
            'occurred_at' => $occurredAt->toDateTimeString(),
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }
};
