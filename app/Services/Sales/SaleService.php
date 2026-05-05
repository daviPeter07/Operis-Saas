<?php

namespace App\Services\Sales;

use App\Enums\SaleStatus;
use App\Enums\StockMovementType;
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
            $totals = $this->calculateTotals($data['items']);
            $status = $data['status'] ?? SaleStatus::Pending->value;

            $sale = $this->sales->createForCompany($companyId, [
                'customer_id' => $data['customer_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $totals,
                'total' => $totals,
                'status' => $status,
                'payment_method' => $data['payment_method'],
                'installments' => $data['installments'] ?? 1,
                'first_installment_date' => $data['first_installment_date'] ?? $data['date'],
                'installment_value' => $data['installment_value'] ?? null,
            ]);

            $this->syncItems($sale, $data['items']);

            if ($status === SaleStatus::Completed->value) {
                $this->applyStock($sale, [], $sale->items->toArray(), StockMovementType::Sale, $userId);
                $this->receivableService->regenerateFromSale($sale);
            }

            return $sale->refresh()->load('items');
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

            $previousItems = $sale->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
            $totals = $this->calculateTotals($data['items']);

            $sale = $this->sales->update($sale, [
                'customer_id' => $data['customer_id'] ?? null,
                'date' => $data['date'],
                'subtotal' => $totals,
                'total' => $totals,
                'payment_method' => $data['payment_method'],
            ]);

            $sale->items()->delete();
            $this->syncItems($sale, $data['items']);

            if ($sale->status === SaleStatus::Completed->value) {
                $newItems = $sale->items()->get()->keyBy('product_id')->map(fn ($item): float => (float) $item->quantity)->all();
                $this->applyStockDiff($sale, $previousItems, $newItems, $userId);
                $this->receivableService->regenerateFromSale($sale);
            }

            return $sale->refresh()->load('items');
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
            if ($sale->status === SaleStatus::Completed->value) {
                $this->applyStock($sale, $sale->items->toArray(), [], StockMovementType::SaleCancel, $userId, true);
            }

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
                'subtotal' => (float) $item['quantity'] * (float) $item['unit_price'],
            ]);
        }
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
}
