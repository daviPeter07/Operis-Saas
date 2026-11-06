<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): void;
}
