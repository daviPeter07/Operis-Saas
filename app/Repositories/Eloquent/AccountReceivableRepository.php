<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountReceivable;
use App\Models\Sale;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AccountReceivableRepository implements AccountReceivableRepositoryInterface
{
    public function paginateByCompany(int $companyId): LengthAwarePaginator
    {
        return AccountReceivable::query()
            ->forCompany($companyId)
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->paginate();
    }

    public function forSale(Sale $sale): Collection
    {
        return AccountReceivable::query()->where('sale_id', $sale->id)->get();
    }

    public function create(array $data): AccountReceivable
    {
        return AccountReceivable::query()->create($data);
    }

    public function openBalanceForCustomer(int $companyId, int $customerId): float
    {
        return (float) AccountReceivable::query()
            ->forCompany($companyId)
            ->where('customer_id', $customerId)
            ->whereNotIn('status', ['received', 'cancelled'])
            ->sum('amount');
    }
}
