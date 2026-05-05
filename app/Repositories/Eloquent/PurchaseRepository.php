<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return Purchase::query()
            ->forCompany($companyId)
            ->with(['items.product.category', 'items.product.brand'])
            ->latest()
            ->paginate();
    }

    public function createForCompany(int $companyId, array $data): Purchase
    {
        return Purchase::query()->create([...$data, 'company_id' => $companyId]);
    }

    public function update(Purchase $purchase, array $data): Purchase
    {
        $purchase->update($data);

        return $purchase->refresh();
    }

    public function delete(Purchase $purchase): void
    {
        $purchase->delete();
    }
}
