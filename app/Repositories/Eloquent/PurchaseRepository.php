<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Purchase::query()
            ->forCompany($companyId)
            ->with(['supplier', 'items.product.category', 'items.product.brand']);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $this->whereRelatedNameContains($query, 'supplier', $tableQuery->filter('supplier'));
        $this->whereRelatedNameContains($query, 'items.product', $tableQuery->filter('product'));

        foreach (['category_id', 'brand_id'] as $productColumn) {
            $value = $tableQuery->filter($productColumn);

            if ($value !== null) {
                $query->whereHas('items.product', fn (Builder $product) => $product->where($productColumn, $value));
            }
        }

        $tableQuery
            ->applyExactFilters($query, ['status' => 'status', 'payment_method' => 'payment_method'])
            ->applyDateRange($query, 'date')
            ->applySort($query, [
                'date' => 'date',
                'due_date' => 'due_date',
                'total' => 'total',
                'created_at' => 'created_at',
            ]);

        return $tableQuery->paginate($query);
    }

    public function createForCompany(int $companyId, array $data): Purchase
    {
        return Purchase::query()->create([...$data, 'company_id' => $companyId]);
    }

    public function update(Purchase $purchase, array $data): Purchase
    {
        $purchase->update($data);

        return $purchase->refresh();
    }

    public function delete(Purchase $purchase): void
    {
        $purchase->delete();
    }

    /**
     * "Contains" match on the name of a related record (the supplier, or any item's product).
     */
    private function whereRelatedNameContains(Builder $query, string $relation, ?string $value): void
    {
        if ($value === null) {
            return;
        }

        $pattern = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value).'%';

        $query->whereHas($relation, fn (Builder $related) => $related->where('name', 'like', $pattern));
    }
}
