<?php

namespace App\Repositories\Contracts;

use App\Models\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SaleRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Sale;

    public function update(Sale $sale, array $data): Sale;
}
