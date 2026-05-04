<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Category::query()->forCompany($companyId)->latest()->paginate();
    }

    public function createForCompany(int $companyId, array $data): Category
    {
        return Category::query()->create([...$data, 'company_id' => $companyId, 'status' => 'active']);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->refresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
