<?php

namespace App\Services\Categories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function __construct(private readonly CategoryRepositoryInterface $categories) {}

    public function list(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        return $this->categories->paginateByCompany($companyId, $tableQuery);
    }

    public function create(int $companyId, array $data): Category
    {
        return $this->categories->createForCompany($companyId, $data);
    }

    public function update(Category $category, array $data): Category
    {
        return $this->categories->update($category, $data);
    }

    public function delete(Category $category): void
    {
        $this->categories->delete($category);
    }
}
