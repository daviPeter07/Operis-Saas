<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Product;

    public function update(Product $product, array $data): Product;

    public function delete(Product $product): void;
}
