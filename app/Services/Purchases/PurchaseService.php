<?php

namespace App\Services\Purchases;

use App\Enums\PurchaseStatus;
use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Services\Finance\PayableService;
use App\Services\Products\StockMovementService;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    public function __construct(
        private readonly PurchaseRepositoryInterface $purchases,
        private readonly StockMovementService $stockMovementService,
        private readonly PayableService $payableService,
    ) {}

    public function list(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        return $this->purchases->paginateByCompany($companyId, $tableQuery);
    }

    public function create(int $companyId, int $userId, array $data): Purchase
    {
        return DB::transaction(function () use ($companyId, $userId, $data): Purchase {
            $status = $data['status'] ?? PurchaseStatus::Pending->value;

            $purchase = $this->purchases->createForCompany($companyId, [
                ...$this->purchaseAttributes($data, $status),
                'notes' => $data['notes'] ?? null,
            ]);

            $this->syncItems($purchase, $data['items']);

            $this->payableService->regenerateFromPurchase($purchase);
            $this->syncPaidBoletos($purchase, $data);

            $this->stockMovementService->reconcile($companyId, $purchase->id, $this->stockTarget($data['items']), StockMovementType::Purchase, $userId, 'purchase');

            $this->maybeUpdateProductCost($purchase, (bool) ($data['update_product_cost'] ?? false));

            return $purchase->refresh()->load(['supplier', 'items.product.category', 'items.product.brand']);
        });
    }

    public function update(Purchase $purchase, int $userId, array $data): Purchase
    {
        return DB::transaction(function () use ($purchase, $userId, $data): Purchase {
            if ($purchase->status === PurchaseStatus::Cancelled->value) {
                throw ValidationException::withMessages([
                    'purchase' => 'Compra cancelada nao pode ser editada.',
                ]);
            }

            $before = $this->financialSnapshot($purchase);
            $nextStatus = $data['status'] ?? $purchase->status ?? PurchaseStatus::Pending->value;

            // Notes are only changed when the request sends them.
            $purchase = $this->purchases->update($purchase, [
                ...$this->purchaseAttributes($data, $nextStatus),
                ...(array_key_exists('notes', $data) ? ['notes' => $data['notes']] : []),
            ]);

            $purchase->items()->delete();
            $this->syncItems($purchase, $data['items']);

            $this->syncPayables($purchase, $before);
            $this->syncPaidBoletos($purchase, $data);

            // Stock follows the items only (lines of the same product added up).
            $this->stockMovementService->reconcile($purchase->company_id, $purchase->id, $this->stockTarget($data['items']), StockMovementType::PurchaseEdit, $userId, 'purchase');
            $this->maybeUpdateProductCost($purchase, (bool) ($data['update_product_cost'] ?? false));

            return $purchase->refresh()->load(['supplier', 'items.product.category', 'items.product.brand']);
        });
    }

    public function cancel(Purchase $purchase, int $userId): Purchase
    {
        return DB::transaction(function () use ($purchase, $userId): Purchase {
            // Locked so two cancel requests cannot both take the stock out.
            $purchase = Purchase::query()->lockForUpdate()->findOrFail($purchase->id);

            if ($purchase->status === PurchaseStatus::Cancelled->value) {
                return $purchase;
            }

            $this->stockMovementService->reconcile($purchase->company_id, $purchase->id, [], StockMovementType::PurchaseCancel, $userId, 'purchase');
            $this->payableService->cancelFromPurchase($purchase);

            return $this->purchases->update($purchase, ['status' => PurchaseStatus::Cancelled->value]);
        });
    }

    public function delete(Purchase $purchase, int $userId): void
    {
        DB::transaction(function () use ($purchase, $userId): void {
            // Takes out whatever the purchase still added to stock (nothing when it was cancelled).
            $this->stockMovementService->reconcile($purchase->company_id, $purchase->id, [], StockMovementType::PurchaseCancel, $userId, 'purchase');

            $purchase->payables()->delete();
            $purchase->items()->delete();
            $purchase->payments()->delete();

            $this->purchases->delete($purchase);
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function purchaseAttributes(array $data, string $status): array
    {
        return [
            'supplier_id' => $data['supplier_id'] ?? null,
            'date' => $data['date'],
            'due_date' => $this->resolveDueDate($data),
            'total' => $this->calculateTotal($data['items']),
            'status' => $status,
            'payment_method' => $data['payment_method'],
            'boleto_term_days' => $data['payment_method'] === 'boleto' ? ($data['boleto_term_days'] ?? 30) : null,
        ];
    }

    /**
     * What the payables are built from. Notes, items with the same total or the supplier alone
     * do not rebuild them, so payments already registered are kept.
     *
     * @return array<string, string|null>
     */
    private function financialSnapshot(Purchase $purchase): array
    {
        return [
            'total' => number_format((float) $purchase->total, 2, '.', ''),
            'payment_method' => $purchase->payment_method,
            'boleto_term_days' => $purchase->boleto_term_days === null ? null : (string) $purchase->boleto_term_days,
            'date' => $purchase->date?->toDateString(),
            'due_date' => $purchase->due_date?->toDateString(),
            'status' => $purchase->status,
        ];
    }

    /**
     * @param  array<string, string|null>  $before
     */
    private function syncPayables(Purchase $purchase, array $before): void
    {
        $after = $this->financialSnapshot($purchase);

        if ($before === $after) {
            $this->payableService->syncPurchaseDetails($purchase);

            return;
        }

        // A pending purchase with some payables already settled in contas a pagar would lose
        // those payments if its payables were rebuilt with a new value or payment method.
        $staysPending = $before['status'] === PurchaseStatus::Pending->value
            && $after['status'] === PurchaseStatus::Pending->value;
        $hasPayments = $staysPending && $purchase->payables()
            ->where('status', '!=', 'cancelled')
            ->where('amount_paid', '>', 0)
            ->exists();

        if ($hasPayments) {
            throw ValidationException::withMessages([
                'purchase' => 'Esta compra ja tem pagamento registrado em contas a pagar. Desfaca a baixa antes de mudar o valor, a data ou a forma de pagamento.',
            ]);
        }

        $this->payableService->regenerateFromPurchase($purchase);
    }

    /**
     * Boletos the buyer marked as already paid on the summary step. Marked ones are settled,
     * unmarked ones that were paid go back to pending (partial payments are left alone), and
     * the purchase is completed only when no boleto is left open.
     */
    private function syncPaidBoletos(Purchase $purchase, array $data): void
    {
        if ($purchase->payment_method !== 'boleto' || ! array_key_exists('paid_installments', $data)) {
            return;
        }

        $paid = collect($data['paid_installments'] ?? [])
            ->map(fn (mixed $number): int => (int) $number)
            ->filter(fn (int $number): bool => $number > 0)
            ->unique()
            ->all();
        $today = now(config('app.business_timezone'))->toDateString();

        foreach ($purchase->payables()->where('status', '!=', 'cancelled')->get() as $payable) {
            $shouldBePaid = in_array((int) $payable->installment_number, $paid, true);

            if ($shouldBePaid && $payable->status !== 'paid') {
                $payable->update([
                    'status' => 'paid',
                    'amount_paid' => $payable->amount,
                    'paid_at' => $today,
                    'paid_method' => 'boleto',
                ]);
            } elseif (! $shouldBePaid && $payable->status === 'paid') {
                $payable->update([
                    'status' => 'pending',
                    'amount_paid' => 0,
                    'paid_at' => null,
                    'paid_method' => null,
                    'payment_notes' => null,
                ]);
            }
        }

        $hasOpenBoletos = $purchase->payables()->whereIn('status', ['pending', 'partial'])->exists();

        $purchase->update([
            'status' => $hasOpenBoletos ? PurchaseStatus::Pending->value : PurchaseStatus::Completed->value,
        ]);
    }

    private function calculateTotal(array $items): float
    {
        return collect($items)->sum(fn (array $item): float => (float) $item['quantity'] * (float) $item['unit_cost']);
    }

    private function syncItems(Purchase $purchase, array $items): void
    {
        foreach ($items as $item) {
            $purchase->items()->create([
                'company_id' => $purchase->company_id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_cost' => $item['unit_cost'],
                'subtotal' => (float) $item['quantity'] * (float) $item['unit_cost'],
            ]);
        }
    }

    /**
     * Stock a purchase should have added, in the "held out of stock" sign the stock service
     * uses (negative = added). Lines of the same product are added up.
     *
     * @return array<int, float>
     */
    private function stockTarget(array $items): array
    {
        return collect($items)
            ->groupBy(fn (array $item): int => (int) $item['product_id'])
            ->map(fn ($group): float => -round((float) $group->sum(fn (array $item): float => (float) $item['quantity']), 2))
            ->all();
    }

    private function maybeUpdateProductCost(Purchase $purchase, bool $shouldUpdate): void
    {
        if (! $shouldUpdate) {
            return;
        }

        foreach ($purchase->items as $item) {
            Product::query()->whereKey($item->product_id)->update(['cost' => $item->unit_cost]);
        }
    }

    private function resolveDueDate(array $data): ?string
    {
        if (($data['payment_method'] ?? null) === 'boleto') {
            return Carbon::parse($data['date'])
                ->addDays((int) ($data['boleto_term_days'] ?? 30))
                ->toDateString();
        }

        return $data['due_date'] ?? null;
    }
}
