<?php

namespace App\Services\Customers;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(private readonly CustomerRepositoryInterface $customers) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->customers->paginateByCompany($companyId);
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
