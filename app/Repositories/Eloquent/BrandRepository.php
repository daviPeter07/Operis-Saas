<?php

namespace App\Repositories\Eloquent;

use App\Models\Brand;
use App\Repositories\Contracts\BrandRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BrandRepository implements BrandRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Brand::query()->forCompany($companyId);

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

    public function createForCompany(int $companyId, array $data): Brand
    {
        return Brand::query()->create([...$data, 'company_id' => $companyId, 'status' => 'active']);
    }

    public function update(Brand $brand, array $data): Brand
    {
        $brand->update($data);

        return $brand->refresh();
    }

    public function delete(Brand $brand): void
    {
        $brand->delete();
    }
}
