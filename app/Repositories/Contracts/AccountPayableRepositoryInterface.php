<?php

namespace App\Repositories\Contracts;

use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface AccountPayableRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function forPurchase(Purchase $purchase): Collection;

    public function create(array $data): AccountPayable;
}
