<?php

namespace App\Services\Products;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    public function __construct(private readonly ProductRepositoryInterface $products) {}

    public function list(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        return $this->products->paginateByCompany($companyId, $tableQuery);
    }

    public function create(int $companyId, array $data): Product
    {
        return $this->products->createForCompany($companyId, $data);
    }

    public function update(Product $product, array $data): Product
    {
        return $this->products->update($product, $data);
    }

    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }
}
