<?php

namespace App\Repositories\Eloquent;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierRepository implements SupplierRepositoryInterface
{
    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Supplier::query()->forCompany($companyId);

        if ($tableQuery === null) {
            return $query->latest()->paginate();
        }

        $tableQuery
            ->applyTextFilters($query, ['name' => 'name', 'email' => 'email'])
            ->applyExactFilters($query, ['person_type' => 'person_type', 'status' => 'status'])
            ->applyDateRange($query, 'created_at', isTimestamp: true)
            ->applySort($query, ['name' => 'name', 'created_at' => 'created_at']);

        $this->applyDigitsFilter($query, 'document', $tableQuery->filter('document'), ['.', '-', '/', ' ']);
        $this->applyDigitsFilter($query, 'phone', $tableQuery->filter('phone'), ['(', ')', '-', ' ']);

        return $tableQuery->paginate($query);
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

    /**
     * Documents and phones are saved with or without the mask, so digits typed
     * in the filter are compared against the column with the mask removed.
     *
     * @param  list<string>  $maskCharacters
     */
    private function applyDigitsFilter(Builder $query, string $column, ?string $value, array $maskCharacters): void
    {
        if ($value === null) {
            return;
        }

        $digits = preg_replace('/\D/', '', $value);

        if ($digits === '') {
            $query->where($column, 'like', '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value).'%');

            return;
        }

        $normalized = array_reduce(
            $maskCharacters,
            fn (string $expression, string $character): string => "REPLACE({$expression}, '{$character}', '')",
            $column,
        );

        $query->whereRaw("{$normalized} like ?", ['%'.$digits.'%']);
    }
}
