<?php

namespace App\Repositories\Contracts;

use App\Models\Purchase;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PurchaseRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Purchase;

    public function update(Purchase $purchase, array $data): Purchase;

    public function delete(Purchase $purchase): void;
}
