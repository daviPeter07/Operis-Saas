<?php

namespace App\Repositories\Contracts;

use App\Models\AccountPayable;
use App\Models\Purchase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface AccountPayableRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator;

    public function forPurchase(Purchase $purchase): Collection;

    public function create(array $data): AccountPayable;
}
