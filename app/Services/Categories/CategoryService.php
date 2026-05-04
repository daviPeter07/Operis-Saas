<?php

namespace App\Services\Categories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function __construct(private readonly CategoryRepositoryInterface $categories) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->categories->paginateByCompany($companyId);
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
