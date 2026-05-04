<?php

namespace App\Services\Products;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    public function __construct(private readonly ProductRepositoryInterface $products) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->products->paginateByCompany($companyId);
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
