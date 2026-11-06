<?php

namespace App\Repositories\Eloquent;

use App\Models\StockMovement;
use App\Repositories\Contracts\StockMovementRepositoryInterface;

class StockMovementRepository implements StockMovementRepositoryInterface
{
    public function create(array $data): StockMovement
    {
        return StockMovement::query()->create($data);
    }

    public function netDeltaByProduct(string $referenceType, int $referenceId): array
    {
        return StockMovement::query()
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->groupBy('product_id')
            ->selectRaw('product_id, sum(quantity_delta) as net')
            ->pluck('net', 'product_id')
            ->map(fn (mixed $net): float => (float) $net)
            ->all();
    }
}
