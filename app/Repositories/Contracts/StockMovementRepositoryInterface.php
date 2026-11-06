<?php

namespace App\Repositories\Contracts;

use App\Models\StockMovement;

interface StockMovementRepositoryInterface
{
    public function create(array $data): StockMovement;

    /**
     * Sum of the stock changes recorded for a document (e.g. a sale), per product.
     *
     * @return array<int, float> product id => net quantity delta
     */
    public function netDeltaByProduct(string $referenceType, int $referenceId): array;
}
