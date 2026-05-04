<?php

namespace App\Repositories\Eloquent;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierRepository implements SupplierRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Supplier::query()->forCompany($companyId)->latest()->paginate();
    }

    public function createForCompany(int $companyId, array $data): Supplier
    {
        return Supplier::query()->create([...$data, 'company_id' => $companyId, 'status' => 'active']);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

        return $supplier->refresh();
    }

    public function delete(Supplier $supplier): void
    {
        $supplier->delete();
    }
}
