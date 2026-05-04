<?php

namespace App\Repositories\Contracts;

use App\Models\AccountReceivable;
use App\Models\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface AccountReceivableRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator;

    public function forSale(Sale $sale): Collection;

    public function create(array $data): AccountReceivable;
}
