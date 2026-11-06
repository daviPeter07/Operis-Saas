<?php

namespace App\Services\Customers;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(private readonly CustomerRepositoryInterface $customers) {}

    public function list(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        return $this->customers->paginateByCompany($companyId, $tableQuery);
    }

    public function withOpenBalance(Customer $customer): Customer
    {
        return $this->customers->loadOpenBalance($customer);
    }

    public function create(int $companyId, array $data): Customer
    {
        return $this->customers->createForCompany($companyId, $data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        return $this->customers->update($customer, $data);
    }

    public function delete(Customer $customer): void
    {
        $this->customers->delete($customer);
    }
}
