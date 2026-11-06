<?php

namespace App\Repositories\Eloquent;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Support\Tables\TableQuery;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerRepository implements CustomerRepositoryInterface
{
    // Characters used by the CPF/CNPJ and phone masks.
    private const MASK_CHARACTERS = ['.', '-', '/', '(', ')', ' '];

    public function paginateByCompany(int $companyId, ?TableQuery $tableQuery = null): LengthAwarePaginator
    {
        $query = Customer::query()->forCompany($companyId);

        if ($tableQuery === null) {
            return $query->latest()->paginate(15);
        }

        $query->withSum('openReceivables as open_balance', 'amount');

        $tableQuery
            ->applyTextFilters($query, ['name' => 'name', 'email' => 'email'])
            ->applyExactFilters($query, ['status' => 'status', 'credit_enabled' => 'credit_enabled'])
            ->applyDateRange($query, 'created_at', isTimestamp: true)
            ->applySort($query, [
                'name' => 'name',
                'credit_limit' => 'credit_limit',
                'created_at' => 'created_at',
            ]);

        $this->applyMaskedFilter($query, $tableQuery, 'document');
        $this->applyMaskedFilter($query, $tableQuery, 'phone');

        // The person type shown on screen comes from the document: more than 11 digits is a CNPJ.
        match ($tableQuery->filter('person_type')) {
            'pj' => $query->whereRaw('CHAR_LENGTH('.$this->digitsOf('document').') > 11'),
            'pf' => $query->where(fn (Builder $where) => $where
                ->whereNull('document')
                ->orWhereRaw('CHAR_LENGTH('.$this->digitsOf('document').') <= 11')),
            default => null,
        };

        return $tableQuery->paginate($query);
    }

    public function loadOpenBalance(Customer $customer): Customer
    {
        return $customer->loadSum('openReceivables as open_balance', 'amount');
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

    /**
     * Matches the typed digits with or without the mask, e.g. "123.456" or "123456".
     */
    private function applyMaskedFilter(Builder $query, TableQuery $tableQuery, string $column): void
    {
        $digits = preg_replace('/\D/', '', (string) $tableQuery->filter($column));

        if ($digits === '') {
            $tableQuery->applyTextFilters($query, [$column => $column]);

            return;
        }

        $query->whereRaw($this->digitsOf($column).' like ?', ['%'.$digits.'%']);
    }

    private function digitsOf(string $column): string
    {
        return collect(self::MASK_CHARACTERS)->reduce(
            fn (string $expression, string $character): string => "REPLACE({$expression}, '{$character}', '')",
            $column,
        );
    }
}
