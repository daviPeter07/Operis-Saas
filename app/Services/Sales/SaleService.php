<?php

namespace App\Services\Sales;

use App\Enums\FinancialStatus;
use App\Enums\SaleStatus;
use App\Enums\StockMovementType;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Repositories\Contracts\SaleRepositoryInterface;
use App\Services\Finance\ReceivableService;
use App\Services\Products\StockMovementService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function __construct(
        private readonly SaleRepositoryInterface $sales,
        private readonly StockMovementService $stockMovementService,
        private readonly ReceivableService $receivableService,
    ) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->sales->paginateByCompany($companyId);
    }

    public function create(int $companyId, int $userId, array $data): Sale
    {
        return DB::transaction(function () use ($companyId, $userId, $data): Sale {
            $this->assertStockAvailability(
                $data['items'],
                [],
                (bool) ($data['allow_negative_stock'] ?? false)
            );

            $totals = $this->calculateTotals($data['items']);
            $paymentMethod = $data['payment_method'];
            $customer = isset($data['customer_id'])
                ? Customer::query()->find($data['customer_id'])
                : null;
            $status = $paymentMethod === 'crediario'
                ? SaleStatus::Pending->value
                : ($data['status'] ?? SaleStatus::Pending->value);

            $sale = $this->sales->createForCompany($companyId, [
                'customer_id' => $data['customer_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $totals,
                'total' => $totals,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'installments' => $this->resolveInstallments($paymentMethod, $data),
                'first_installment_date' => $this->resolveFirstInstallmentDate($paymentMethod, $data, $customer),
                'installment_value' => $data['installment_value'] ?? null,
                'crediario_entry' => $paymentMethod === 'crediario'
                    ? (float) ($data['crediario_entry'] ?? 0)
                    : 0,
            ]);

            $this->syncItems($sale, $data['items']);
            $sale->load('customer');
            $this->ensureCrediarioIsAllowed($sale);

            $this->receivableService->regenerateFromSale($sale);

            if ($paymentMethod === 'crediario') {
                $paidInstallments = collect($data['paid_installments'] ?? [])
                    ->map(fn ($value) => (int) $value)
                    ->filter(fn (int $value) => $value > 0)
                    ->unique()
                    ->values()
                    ->all();

                if (! empty($paidInstallments)) {
                    $receivablesToSettle = $sale->receivables()
                        ->whereIn('installment_number', $paidInstallments)
                        ->get();

                    foreach ($receivablesToSettle as $receivable) {
                        $this->receivableService->settle($receivable, $userId, [
                            'received_at' => now()->toDateString(),
                        ]);
                    }
                }
            }

            // Always deduct stock on creation, regardless of status (including crediário)
            $this->applyStock($sale, [], $sale->items->toArray(), StockMovementType::Sale, $userId);
            // If all crediário installments are already settled, mark the sale as completed (stock already deducted)
            if ($paymentMethod === 'crediario') {
                $allSettled = $sale->receivables()->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value])->doesntExist();
                if ($allSettled) {
                    $sale->update(['status' => SaleStatus::Completed->value]);
                }
            }

            return $sale->refresh()->load(['items.product.category', 'customer']);
        });
    }

    public function update(Sale $sale, int $userId, array $data): Sale
    {
        return DB::transaction(function () use ($sale, $userId, $data): Sale {
            if ($sale->status === SaleStatus::Cancelled->value) {
                throw ValidationException::withMessages([
                    'sale' => 'Venda cancelada nao pode ser editada.',
                ]);
            }

            $previousStatus = $sale->status;
            $previousItems = $sale->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
            $this->assertStockAvailability(
                $data['items'],
                $previousItems,
                (bool) ($data['allow_negative_stock'] ?? false)
            );
            $totals = $this->calculateTotals($data['items']);
            $paymentMethod = $data['payment_method'];
            $customer = isset($data['customer_id'])
                ? Customer::query()->find($data['customer_id'])
                : null;
            $nextStatus = $paymentMethod === 'crediario'
                ? SaleStatus::Pending->value
                : ($data['status'] ?? $sale->status ?? SaleStatus::Pending->value);

            $sale = $this->sales->update($sale, [
                'customer_id' => $data['customer_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $totals,
                'total' => $totals,
                'status' => $nextStatus,
                'payment_method' => $paymentMethod,
                'installments' => $this->resolveInstallments($paymentMethod, $data),
                'first_installment_date' => $this->resolveFirstInstallmentDate($paymentMethod, $data, $customer),
                'installment_value' => $data['installment_value'] ?? null,
                'crediario_entry' => $paymentMethod === 'crediario'
                    ? (float) ($data['crediario_entry'] ?? 0)
                    : 0,
            ]);

            $sale->items()->delete();
            $this->syncItems($sale, $data['items']);
            $sale->load('customer');
            $this->ensureCrediarioIsAllowed($sale);

            $this->receivableService->regenerateFromSale($sale);

            if ($paymentMethod === 'crediario') {
                $paidInstallments = collect($data['paid_installments'] ?? [])
                    ->map(fn ($value) => (int) $value)
                    ->filter(fn (int $value) => $value > 0)
                    ->unique()
                    ->values()
                    ->all();

                if (! empty($paidInstallments)) {
                    $receivablesToSettle = $sale->receivables()
                        ->whereIn('installment_number', $paidInstallments)
                        ->get();

                    foreach ($receivablesToSettle as $receivable) {
                        $this->receivableService->settle($receivable, $userId, [
                            'received_at' => now()->toDateString(),
                        ]);
                    }
                }
            }

            // If all crediário receivables are settled, update status (stock already deducted on creation)
            if ($paymentMethod === 'crediario') {
                $allSettled = $sale->receivables()->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value])->doesntExist();
                if ($allSettled) {
                    $sale->update(['status' => SaleStatus::Completed->value]);
                }
            }

            // If a completed sale is set back to pending, revert stock
            if ($previousStatus === SaleStatus::Completed->value && $sale->status !== SaleStatus::Completed->value) {
                $this->applyStock($sale, $sale->items->toArray(), [], StockMovementType::SaleEdit, $userId, true);
            } elseif ($sale->status === SaleStatus::Completed->value) {
                // Adjust stock diff when items change on a completed sale
                $newItems = $sale->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
                $this->applyStockDiff($sale, $previousItems, $newItems, $userId);
            }

            return $sale->refresh()->load(['items.product.category', 'customer']);
        });
    }

    public function cancel(Sale $sale, int $userId): Sale
    {
        return DB::transaction(function () use ($sale, $userId): Sale {
            if ($sale->status === SaleStatus::Cancelled->value) {
                return $sale;
            }

            if ($sale->status === SaleStatus::Completed->value) {
                $this->applyStock($sale, $sale->items->toArray(), [], StockMovementType::SaleCancel, $userId, true);
                $this->receivableService->cancelFromSale($sale);
            }

            return $this->sales->update($sale, ['status' => SaleStatus::Cancelled->value]);
        });
    }

    public function delete(Sale $sale, int $userId): void
    {
        DB::transaction(function () use ($sale, $userId): void {
            // Sempre reverter o estoque ao excluir a venda, independente do status
            $this->applyStock($sale, $sale->items->toArray(), [], StockMovementType::SaleCancel, $userId, true);

            $sale->receivables()->delete();
            $sale->items()->delete();
            $sale->payments()->delete();

            $this->sales->delete($sale);
        });
    }

    private function calculateTotals(array $items): float
    {
        return collect($items)->sum(fn (array $item): float => (float) $item['quantity'] * (float) $item['unit_price']);
    }

    private function syncItems(Sale $sale, array $items): void
    {
        foreach ($items as $item) {
            $sale->items()->create([
                'company_id' => $sale->company_id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'unit_cost' => Product::query()->findOrFail($item['product_id'])->cost,
                'subtotal' => (float) $item['quantity'] * (float) $item['unit_price'],
            ]);
        }
    }

    private function ensureCrediarioIsAllowed(Sale $sale): void
    {
        if ($sale->payment_method !== 'crediario') {
            return;
        }

        $customer = $sale->customer;

        if (! $customer) {
            throw ValidationException::withMessages([
                'customer_id' => 'Venda em crediario exige um cliente vinculado.',
            ]);
        }

        if (! $customer->credit_enabled) {
            throw ValidationException::withMessages([
                'payment_method' => 'Cliente selecionado nao possui crediario habilitado.',
            ]);
        }

        $currentBalance = $this->receivableService->customerOpenBalance(
            $sale->company_id,
            $customer->id
        );
        $saleCurrentBalance = (float) $sale->receivables()
            ->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value])
            ->sum('amount');

        $crediarioEntry = (float) ($sale->crediario_entry ?? 0);
        $financedTotal = (float) $sale->total - $crediarioEntry;

        if ($crediarioEntry <= 0 || $financedTotal <= 0) {
            throw ValidationException::withMessages([
                'crediario_entry' => 'Venda em crediario exige entrada maior que zero e menor que o total.',
            ]);
        }

        $maxInstallments = max(1, (int) floor(((int) ($customer->credit_term_days ?? 30)) / 30));
        if ((int) ($sale->installments ?? 1) > $maxInstallments) {
            throw ValidationException::withMessages([
                'installments' => "Numero de parcelas excede o prazo permitido para este cliente ({$maxInstallments}).",
            ]);
        }

        if ((($currentBalance - $saleCurrentBalance) + $financedTotal) > (float) $customer->credit_limit) {
            throw ValidationException::withMessages([
                'payment_method' => 'Limite de crediario do cliente excedido.',
            ]);
        }
    }

    private function resolveInstallments(string $paymentMethod, array $data): int
    {
        if (in_array($paymentMethod, ['card_credit', 'crediario'])) {
            return max(1, (int) ($data['installments'] ?? 1));
        }

        return 1;
    }

    private function resolveFirstInstallmentDate(string $paymentMethod, array $data, ?Customer $customer): string
    {
        if ($paymentMethod === 'card_credit') {
            return $data['first_installment_date'] ?? $data['date'];
        }

        if ($paymentMethod === 'crediario') {
            return $this->receivableService->resolveCrediarioDueDate(
                $data['date'],
                30,
            );
        }

        return $data['date'];
    }

    private function applyStock(Sale $sale, array $oldItems, array $newItems, StockMovementType $type, int $userId, bool $reverse = false): void
    {
        $items = $reverse ? $oldItems : $newItems;

        foreach ($items as $item) {
            $product = Product::query()->findOrFail($item['product_id']);
            $delta = $reverse ? (float) $item['quantity'] : -(float) $item['quantity'];
            $this->stockMovementService->register($product, $delta, $type, $sale->id, $userId);
        }
    }

    private function applyStockDiff(Sale $sale, array $previousItems, array $newItems, int $userId): void
    {
        $productIds = collect(array_keys($previousItems))->merge(array_keys($newItems))->unique();

        foreach ($productIds as $productId) {
            $previous = $previousItems[$productId] ?? 0.0;
            $current = $newItems[$productId] ?? 0.0;
            $diff = $current - $previous;

            if ($diff === 0.0) {
                continue;
            }

            $product = Product::query()->findOrFail($productId);
            $this->stockMovementService->register($product, -$diff, StockMovementType::SaleEdit, $sale->id, $userId);
        }
    }

    /**
     * @param  array<int, array{product_id:int, quantity:float|int|string}>  $items
     * @param  array<int, float>  $previousItems
     */
    private function assertStockAvailability(array $items, array $previousItems = [], bool $allowNegativeStock = false): void
    {
        if ($allowNegativeStock) {
            return;
        }

        $requestedByProduct = collect($items)
            ->groupBy(fn (array $item): int => (int) $item['product_id'])
            ->map(fn ($group): float => (float) $group->sum(fn (array $item): float => (float) $item['quantity']))
            ->all();

        $insufficientItems = [];

        foreach ($requestedByProduct as $productId => $requestedQuantity) {
            $product = Product::query()->findOrFail((int) $productId);
            $available = (float) $product->stock + (float) ($previousItems[(int) $productId] ?? 0.0);

            if ($requestedQuantity <= $available) {
                continue;
            }

            $insufficientItems[] = [
                'product_id' => (int) $productId,
                'product_name' => $product->name,
                'available' => $available,
                'requested' => $requestedQuantity,
            ];
        }

        if ($insufficientItems === []) {
            return;
        }

        throw ValidationException::withMessages([
            'stock' => 'Estoque insuficiente para concluir a venda.',
            'stock_items' => $insufficientItems,
        ]);
    }
}
