<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountReceivable;
use App\Models\Sale;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AccountReceivableRepository implements AccountReceivableRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = AccountReceivable::query()
            ->forCompany($companyId)
            ->with(['customer', 'sale.items.product.category']);

        if ($tableQuery === null) {
            return $query->where('status', '!=', 'cancelled')->latest()->paginate();
        }

        $status = $tableQuery->filter('status');

        // Cancelled records only show up when asked for.
        if ($status === null) {
            $query->where('status', '!=', 'cancelled');
        } else {
            $query->where('status', $status);
        }

        $customer = $tableQuery->filter('customer');

        if ($customer !== null) {
            $query->whereHas('customer', fn (Builder $related) => $related->where('name', 'like', $this->containsPattern($customer)));
        }

        $description = $tableQuery->filter('description');

        if ($description !== null) {
            $pattern = $this->containsPattern($description);
            $query->where(fn (Builder $where) => $where->where('item', 'like', $pattern)->orWhere('description', 'like', $pattern));
        }

        match ($tableQuery->filter('origin')) {
            'sale' => $query->whereNotNull('sale_id'),
            'manual' => $query->whereNull('sale_id'),
            default => null,
        };

        $tableQuery
            ->applyDateRange($query, 'due_date')
            ->applySort($query, [
                'amount' => 'amount',
                'due_date' => 'due_date',
                'entry_date' => 'entry_date',
                'created_at' => 'created_at',
            ]);

        return $tableQuery->paginate($query);
    }

    private function containsPattern(string $value): string
    {
        return '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value).'%';
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
