<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Category::query()->forCompany($companyId);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $tableQuery
            ->applyTextFilters($query, ['name' => 'name'])
            ->applyExactFilters($query, ['status' => 'status'])
            ->applyDateRange($query, 'created_at', isTimestamp: true)
            ->applySort($query, ['name' => 'name', 'created_at' => 'created_at']);

        return $tableQuery->paginate($query);
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
