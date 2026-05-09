<?php

namespace App\Services\Brands;

use App\Models\Brand;
use App\Repositories\Contracts\BrandRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BrandService
{
    public function __construct(private readonly BrandRepositoryInterface $brands) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->brands->paginateByCompany($companyId);
    }

    public function create(int $companyId, array $data): Brand
    {
        $data = array_merge(['status' => 'active'], $data);
        return $this->brands->createForCompany($companyId, $data);
    }

    public function update(Brand $brand, array $data): Brand
    {
        return $this->brands->update($brand, $data);
    }

    public function delete(Brand $brand): void
    {
        $this->brands->delete($brand);
    }
}
