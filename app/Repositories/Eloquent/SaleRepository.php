<?php

namespace App\Repositories\Eloquent;

use App\Models\Sale;
use App\Repositories\Contracts\SaleRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SaleRepository implements SaleRepositoryInterface
{
    /**
     * Without table parameters this is the listing other screens load in full:
     * newest first, 15 per page.
     */
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Sale::query()
            ->forCompany($companyId)
            ->withProfit()
            ->with(['customer', 'items.product.category', 'items.product.brand']);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $this->whereRelatedNameContains($query, 'customer', $tableQuery->filter('customer'));
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
                'total' => 'total',
                'profit' => 'profit',
                'created_at' => 'created_at',
            ]);

        return $tableQuery->paginate($query);
    }

    public function createForCompany(int $companyId, array $data): Sale
    {
        return Sale::query()->create([...$data, 'company_id' => $companyId]);
    }

    public function update(Sale $sale, array $data): Sale
    {
        $sale->update($data);

        return $sale->refresh();
    }

    public function delete(Sale $sale): void
    {
        $sale->delete();
    }

    /**
     * "Contains" match on the name of a related record (the customer, or any item's product).
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
