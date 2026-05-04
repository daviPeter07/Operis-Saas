<?php

namespace App\Repositories\Eloquent;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Customer::query()->forCompany($companyId)->latest()->paginate(15);
    }

    public function createForCompany(int $companyId, array $data): Customer
    {
        return Customer::query()->create([...$data, 'company_id' => $companyId, 'status' => 'active']);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->refresh();
    }

    public function delete(Customer $customer): void
    {
        $customer->delete();
    }
}
