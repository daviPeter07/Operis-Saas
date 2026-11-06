<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountPayable;
use App\Models\Purchase;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AccountPayableRepository implements AccountPayableRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = AccountPayable::query()
            ->forCompany($companyId)
            ->with(['supplier', 'purchase.items']);

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

        $supplier = $tableQuery->filter('supplier');

        if ($supplier !== null) {
            $query->whereHas('supplier', fn (Builder $related) => $related->where('name', 'like', $this->containsPattern($supplier)));
        }

        $description = $tableQuery->filter('description');

        if ($description !== null) {
            $pattern = $this->containsPattern($description);
            $query->where(fn (Builder $where) => $where->where('item', 'like', $pattern)->orWhere('description', 'like', $pattern));
        }

        match ($tableQuery->filter('origin')) {
            'purchase' => $query->whereNotNull('purchase_id'),
            'manual' => $query->whereNull('purchase_id'),
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

    public function forPurchase(Purchase $purchase): Collection
    {
        return AccountPayable::query()->where('purchase_id', $purchase->id)->get();
    }

    public function create(array $data): AccountPayable
    {
        return AccountPayable::query()->create($data);
    }
}
