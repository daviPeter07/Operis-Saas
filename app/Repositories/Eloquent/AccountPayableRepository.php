<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AccountPayableRepository implements AccountPayableRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return AccountPayable::query()
            ->forCompany($companyId)
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->paginate();
    }

    public function forPurchase(Purchase $purchase): Collection
    {
        return AccountPayable::query()->where('purchase_id', $purchase->id)->get();
    }

    public function create(array $data): AccountPayable
    {
        return AccountPayable::query()->create($data);
    }
}
