<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * Without a TableQuery this keeps the default listing (newest first, 15 per page)
     * used by screens that load every product.
     */
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Product::query()->forCompany($companyId);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $tableQuery
            ->applyTextFilters($query, ['name' => 'name', 'sku' => ['sku', 'barcode'], 'barcode' => 'barcode'])
            ->applyExactFilters($query, ['brand_id' => 'brand_id', 'category_id' => 'category_id', 'status' => 'status'])
            ->applyDateRange($query, 'created_at', isTimestamp: true)
            ->applySort($query, [
                'name' => 'name',
                'sku' => 'sku',
                'cost' => 'cost',
                'sale_price' => 'sale_price',
                'stock' => 'stock',
                'min_stock' => 'min_stock',
                'created_at' => 'created_at',
            ]);

        match ($tableQuery->filter('stock_status')) {
            'out_of_stock' => $query->where('stock', '<=', 0),
            'below_minimum' => $query->whereColumn('stock', '<', 'min_stock'),
            default => null,
        };

        return $tableQuery->paginate($query);
    }

    public function createForCompany(int $companyId, array $data): Product
    {
        return Product::query()->create([...$data, 'company_id' => $companyId, 'status' => 'active']);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
