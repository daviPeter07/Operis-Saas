<?php

namespace App\Repositories\Eloquent;

use App\Models\Brand;
use App\Repositories\Contracts\BrandRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BrandRepository implements BrandRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Brand::query()->forCompany($companyId)->latest()->paginate();
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
