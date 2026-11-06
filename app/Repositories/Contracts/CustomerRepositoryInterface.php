<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator;

    public function loadOpenBalance(Customer $customer): Customer;

    public function createForCompany(int $companyId, array $data): Customer;

    public function update(Customer $customer, array $data): Customer;

    public function delete(Customer $customer): void;
}
