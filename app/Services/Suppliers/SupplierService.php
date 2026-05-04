<?php

namespace App\Services\Suppliers;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierService
{
    public function __construct(private readonly SupplierRepositoryInterface $suppliers) {}

    public function list(int $companyId): LengthAwarePaginator
    {
        return $this->suppliers->paginateByCompany($companyId);
    }

    public function create(int $companyId, array $data): Supplier
    {
        return $this->suppliers->createForCompany($companyId, $data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        return $this->suppliers->update($supplier, $data);
    }

    public function delete(Supplier $supplier): void
    {
        $this->suppliers->delete($supplier);
    }
}
