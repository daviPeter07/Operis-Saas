<?php

namespace App\Repositories\Contracts;

use App\Models\Service;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ServiceRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function createForCompany(int $companyId, array $data): Service;

    public function update(Service $service, array $data): Service;

    public function delete(Service $service): void;
}
