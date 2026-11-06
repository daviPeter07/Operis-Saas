<?php

namespace App\Services\Products;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Repositories\Contracts\StockMovementRepositoryInterface;

class StockMovementService
{
    public function __construct(private readonly StockMovementRepositoryInterface $stockMovements) {}

    public function register(Product $product, float $delta, StockMovementType $type, int $referenceId, ?int $userId = null, string $referenceType = 'sale'): void
    {
        $product->increment('stock', $delta);

        $this->stockMovements->create([
            'company_id' => $product->company_id,
            'product_id' => $product->id,
            'type' => $type->value,
            'quantity_delta' => $delta,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'created_by' => $userId,
        ]);
    }

    /**
     * Quantity of each product a document still holds out of stock (positive = taken out),
     * from the movements recorded for it.
     *
     * @return array<int, float> product id => quantity
     */
    public function outstandingByProduct(int $referenceId, string $referenceType = 'sale'): array
    {
        return collect($this->stockMovements->netDeltaByProduct($referenceType, $referenceId))
            ->map(fn (float $net): float => round(-$net, 2))
            ->filter(fn (float $quantity): bool => $quantity !== 0.0)
            ->all();
    }

    /**
     * Moves stock so the document holds exactly $targetByProduct out of stock, whatever it
     * held before. An empty target gives everything back (cancel, delete).
     *
     * @param  array<int, float>  $targetByProduct  product id => quantity that should be out of stock
     */
    public function reconcile(int $companyId, int $referenceId, array $targetByProduct, StockMovementType $type, ?int $userId = null, string $referenceType = 'sale'): void
    {
        $outstanding = $this->outstandingByProduct($referenceId, $referenceType);
        $productIds = collect(array_keys($outstanding))->merge(array_keys($targetByProduct))->unique();

        foreach ($productIds as $productId) {
            $delta = round(($outstanding[$productId] ?? 0.0) - ($targetByProduct[$productId] ?? 0.0), 2);

            if ($delta === 0.0) {
                continue;
            }

            $product = Product::query()->where('company_id', $companyId)->findOrFail($productId);
            $this->register($product, $delta, $type, $referenceId, $userId, $referenceType);
        }
    }
}
