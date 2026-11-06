<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Builds the history of sales saved before sale_events existed, from what the database has:
 * - "Venda registrada" at the sale's created_at;
 * - one event per received (or partly received) receivable at its received_at; a completed
 *   non-crediário sale whose receivables were all received at once gets a single "Pagamento recebido";
 * - completed sales: completed_at = the last payment (or updated_at when there is none);
 * - cancelled sales: cancelled_at = updated_at (the cancel is the sale's last change).
 *
 * Only sales without any event are touched and completed_at / cancelled_at are only filled
 * when empty, so running it again changes nothing. Event times never come before the sale's
 * creation.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('sales')
            ->whereNotExists(fn ($events) => $events->selectRaw('1')->from('sale_events')->whereColumn('sale_events.sale_id', 'sales.id'))
            ->select(['id', 'company_id', 'status', 'payment_method', 'installments', 'total', 'date', 'completed_at', 'cancelled_at', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->chunkById(200, function (Collection $sales): void {
                $receivables = DB::table('account_receivables')
                    ->whereIn('sale_id', $sales->pluck('id'))
                    ->whereIn('status', ['received', 'partial'])
                    ->where('amount_paid', '>', 0)
                    ->orderBy('id')
                    ->get(['sale_id', 'installment_number', 'amount_paid', 'status', 'received_at'])
                    ->groupBy('sale_id');

                DB::transaction(function () use ($sales, $receivables): void {
                    foreach ($sales as $sale) {
                        $this->backfillSale($sale, $receivables->get($sale->id, collect()));
                    }
                });
            });
    }

    public function down(): void
    {
        // The events and columns are dropped by the migrations that created them.
    }

    private function backfillSale(object $sale, Collection $payments): void
    {
        $createdAt = $sale->created_at !== null
            ? Carbon::parse($sale->created_at, 'UTC')
            : Carbon::parse($sale->date, config('app.business_timezone'))->setTime(12, 0)->utc();
        $updatedAt = $sale->updated_at !== null ? Carbon::parse($sale->updated_at, 'UTC') : $createdAt;
        $notBeforeCreation = fn (Carbon $moment): Carbon => $moment->lessThan($createdAt) ? $createdAt->copy() : $moment;

        $events = [$this->event($sale, 'created', 'Venda registrada', (float) $sale->total, $createdAt)];
        $lastPaymentAt = null;

        $paymentRows = $payments->map(fn (object $receivable): array => [
            'receivable' => $receivable,
            'at' => $notBeforeCreation($this->receivedAt($receivable->received_at, $createdAt)),
        ]);

        // A non-crediário sale saved as completed had all its receivables received at once.
        $isSinglePayment = $sale->payment_method !== 'crediario'
            && $sale->status === 'completed'
            && $paymentRows->isNotEmpty()
            && $paymentRows->every(fn (array $row): bool => $row['receivable']->status === 'received')
            && $paymentRows->pluck('at')->map(fn (Carbon $at): string => $at->toDateTimeString())->unique()->count() === 1;

        if ($isSinglePayment) {
            $at = $paymentRows->first()['at'];
            $events[] = $this->event($sale, 'payment_received', 'Pagamento recebido', (float) $paymentRows->sum(fn (array $row): float => (float) $row['receivable']->amount_paid), $at);
            $lastPaymentAt = $at;
        } else {
            foreach ($paymentRows->sortBy(fn (array $row): int => $row['at']->getTimestamp()) as $row) {
                $receivable = $row['receivable'];
                $events[] = $this->event($sale, 'payment_received', $this->paymentDescription($sale, $receivable), (float) $receivable->amount_paid, $row['at']);
                $lastPaymentAt = $lastPaymentAt === null || $row['at']->greaterThan($lastPaymentAt) ? $row['at'] : $lastPaymentAt;
            }
        }

        $changes = [];

        if ($sale->status === 'completed') {
            $completedAt = $sale->completed_at !== null
                ? Carbon::parse($sale->completed_at, 'UTC')
                : ($lastPaymentAt ?? $notBeforeCreation($updatedAt));
            $events[] = $this->event($sale, 'completed', 'Venda concluída', (float) $sale->total, $completedAt);

            if ($sale->completed_at === null) {
                $changes['completed_at'] = $completedAt->toDateTimeString();
            }
        }

        if ($sale->status === 'cancelled') {
            $cancelledAt = $sale->cancelled_at !== null
                ? Carbon::parse($sale->cancelled_at, 'UTC')
                : $notBeforeCreation($updatedAt);
            $events[] = $this->event($sale, 'cancelled', 'Venda cancelada', (float) $sale->total, $cancelledAt);

            if ($sale->cancelled_at === null) {
                $changes['cancelled_at'] = $cancelledAt->toDateTimeString();
            }
        }

        DB::table('sale_events')->insert($events);

        if ($changes !== []) {
            // Keeps updated_at as it was: it is part of the sale's own record.
            DB::table('sales')->where('id', $sale->id)->update($changes);
        }
    }

    /**
     * Payments settled from the receivables screen stored only the chosen day (midnight).
     * That day is a Manaus calendar day, so midnight is read in the business timezone.
     */
    private function receivedAt(?string $receivedAt, Carbon $fallback): Carbon
    {
        if ($receivedAt === null) {
            return $fallback->copy();
        }

        $moment = Carbon::parse($receivedAt, 'UTC');

        return $moment->format('H:i:s') === '00:00:00'
            ? Carbon::parse($moment->toDateString(), config('app.business_timezone'))->utc()
            : $moment;
    }

    private function paymentDescription(object $sale, object $receivable): string
    {
        $partial = $receivable->status === 'partial';

        if ($receivable->installment_number === null) {
            if ($sale->payment_method === 'crediario') {
                return $partial ? 'Pagamento parcial da entrada recebido' : 'Entrada recebida';
            }

            return $partial ? 'Pagamento parcial recebido' : 'Pagamento recebido';
        }

        if ($sale->payment_method === 'crediario' || (int) $sale->installments > 1) {
            return $partial
                ? "Pagamento parcial da parcela {$receivable->installment_number} recebido"
                : "Parcela {$receivable->installment_number} recebida";
        }

        return $partial ? 'Pagamento parcial recebido' : 'Pagamento recebido';
    }

    /**
     * @return array<string, mixed>
     */
    private function event(object $sale, string $type, string $description, ?float $amount, Carbon $occurredAt): array
    {
        $now = now()->toDateTimeString();

        return [
            'company_id' => $sale->company_id,
            'sale_id' => $sale->id,
            'type' => $type,
            'description' => $description,
            'amount' => $amount === null ? null : round($amount, 2),
            'occurred_at' => $occurredAt->toDateTimeString(),
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }
};
