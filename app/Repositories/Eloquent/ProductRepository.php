<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Product::query()->forCompany($companyId)->latest()->paginate();
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
