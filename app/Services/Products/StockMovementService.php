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
}
