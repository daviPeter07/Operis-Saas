<?php

namespace App\Services\Purchases;

use App\Enums\PurchaseStatus;
use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Services\Finance\PayableService;
use App\Services\Products\StockMovementService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    public function __construct(
        private readonly PurchaseRepositoryInterface $purchases,
        private readonly StockMovementService $stockMovementService,
        private readonly PayableService $payableService,
    ) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->purchases->paginateByCompany($companyId);
    }

    public function create(int $companyId, int $userId, array $data): Purchase
    {
        return DB::transaction(function () use ($companyId, $userId, $data): Purchase {
            $total = $this->calculateTotal($data['items']);
            $status = $data['status'] ?? PurchaseStatus::Pending->value;

            $purchase = $this->purchases->createForCompany($companyId, [
                'supplier_id' => $data['supplier_id'] ?? null,
                'date' => $data['date'],
                'due_date' => $data['due_date'] ?? null,
                'total' => $total,
                'status' => $status,
                'payment_method' => $data['payment_method'],
            ]);

            $this->syncItems($purchase, $data['items']);

            if ($status === PurchaseStatus::Completed->value) {
                $this->applyStock($purchase, [], $purchase->items->toArray(), $userId);
                $this->maybeUpdateProductCost($purchase, (bool) ($data['update_product_cost'] ?? false));
                $this->payableService->regenerateFromPurchase($purchase);
            }

            return $purchase->refresh()->load(['items.product.category', 'items.product.brand']);
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

            $previousItems = $purchase->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
            $total = $this->calculateTotal($data['items']);

            $purchase = $this->purchases->update($purchase, [
                'supplier_id' => $data['supplier_id'] ?? null,
                'date' => $data['date'],
                'due_date' => $data['due_date'] ?? null,
                'total' => $total,
                'payment_method' => $data['payment_method'],
            ]);

            $purchase->items()->delete();
            $this->syncItems($purchase, $data['items']);

            if ($purchase->status === PurchaseStatus::Completed->value) {
                $newItems = $purchase->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
                $this->applyStockDiff($purchase, $previousItems, $newItems, $userId);
                $this->maybeUpdateProductCost($purchase, (bool) ($data['update_product_cost'] ?? false));
                $this->payableService->regenerateFromPurchase($purchase);
            }

            return $purchase->refresh()->load(['items.product.category', 'items.product.brand']);
        });
    }

    public function cancel(Purchase $purchase, int $userId): Purchase
    {
        return DB::transaction(function () use ($purchase, $userId): Purchase {
            if ($purchase->status === PurchaseStatus::Cancelled->value) {
                return $purchase;
            }

            if ($purchase->status === PurchaseStatus::Completed->value) {
                foreach ($purchase->items as $item) {
                    $product = Product::query()->findOrFail($item->product_id);
                    $this->stockMovementService->register(
                        $product,
                        -(float) $item->quantity,
                        StockMovementType::PurchaseCancel,
                        $purchase->id,
                        $userId,
                        'purchase'
                    );
                }

                $this->payableService->cancelFromPurchase($purchase);
            }

            return $this->purchases->update($purchase, ['status' => PurchaseStatus::Cancelled->value]);
        });
    }

    public function delete(Purchase $purchase, int $userId): void
    {
        DB::transaction(function () use ($purchase, $userId): void {
            if ($purchase->status === PurchaseStatus::Completed->value) {
                foreach ($purchase->items as $item) {
                    $product = Product::query()->findOrFail($item->product_id);
                    $this->stockMovementService->register(
                        $product,
                        -(float) $item->quantity,
                        StockMovementType::PurchaseCancel,
                        $purchase->id,
                        $userId,
                        'purchase'
                    );
                }
            }

            $purchase->payables()->delete();
            $purchase->items()->delete();
            $purchase->payments()->delete();

            $this->purchases->delete($purchase);
        });
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

    private function applyStock(Purchase $purchase, array $oldItems, array $newItems, int $userId): void
    {
        foreach ($newItems as $item) {
            $product = Product::query()->findOrFail($item['product_id']);
            $this->stockMovementService->register(
                $product,
                (float) $item['quantity'],
                StockMovementType::Purchase,
                $purchase->id,
                $userId,
                'purchase'
            );
        }
    }

    private function applyStockDiff(Purchase $purchase, array $previousItems, array $newItems, int $userId): void
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
            $this->stockMovementService->register(
                $product,
                $diff,
                StockMovementType::PurchaseEdit,
                $purchase->id,
                $userId,
                'purchase'
            );
        }
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
}
