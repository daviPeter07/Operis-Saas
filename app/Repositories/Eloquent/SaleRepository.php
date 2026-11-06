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
            ->withOpenAmount()
            ->with(['customer', 'items.product.category', 'items.product.brand', 'items.service']);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $this->whereRelatedNameContains($query, 'customer', $tableQuery->filter('customer'));
        $this->whereItemNameContains($query, $tableQuery->filter('product'));

        // The sales of one service, opened from "Realizados" on the services table.
        $serviceId = $tableQuery->filter('service_id');

        if ($serviceId !== null) {
            $query->whereHas('items', fn (Builder $item) => $item->where('service_id', (int) $serviceId));
        }

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

        // A single record, opened from "Últimas atividades" on Visão Geral.
        $id = $tableQuery->filter('id');

        if ($id !== null) {
            $query->whereKey((int) $id);
        }

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
     * "Contains" match on the name of any item: a product or a service.
     */
    private function whereItemNameContains(Builder $query, ?string $value): void
    {
        if ($value === null) {
            return;
        }

        $pattern = $this->likePattern($value);

        $query->whereHas('items', fn (Builder $item) => $item->where(fn (Builder $name) => $name
            ->whereHas('product', fn (Builder $product) => $product->where('name', 'like', $pattern))
            ->orWhereHas('service', fn (Builder $service) => $service->where('name', 'like', $pattern))));
    }

    private function likePattern(string $value): string
    {
        return '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value).'%';
    }

    /**
     * "Contains" match on the name of a related record (the customer).
     */
    private function whereRelatedNameContains(Builder $query, string $relation, ?string $value): void
    {
        if ($value === null) {
            return;
        }

        $pattern = $this->likePattern($value);

        $query->whereHas($relation, fn (Builder $related) => $related->where('name', 'like', $pattern));
    }
}
