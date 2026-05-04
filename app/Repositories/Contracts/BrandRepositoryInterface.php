<?php

namespace App\Repositories\Contracts;

use App\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BrandRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Brand;

    public function update(Brand $brand, array $data): Brand;

    public function delete(Brand $brand): void;
}
