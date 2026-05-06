<?php

namespace App\Repositories\Eloquent;

use App\Models\Sale;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SaleRepository implements SaleRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Sale::query()
            ->forCompany($companyId)
            ->with(['customer', 'items.product.category'])
            ->latest()
            ->paginate();
    }

    public function createForCompany(int $companyId, array $data): Sale
    {
        return Sale::query()->create([...$data, 'company_id' => $companyId]);
    }

    public function update(Sale $sale, array $data): Sale
    {
        $sale->update($data);

        return $sale->refresh();
    }

    public function delete(Sale $sale): void
    {
        $sale->delete();
    }
}
