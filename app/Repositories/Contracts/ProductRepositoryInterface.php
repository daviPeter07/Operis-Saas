<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Product;

    public function update(Product $product, array $data): Product;

    public function delete(Product $product): void;
}
