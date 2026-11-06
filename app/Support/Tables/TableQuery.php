<?php

namespace App\Support\Tables;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

/**
 * Filters, sorting and page size requested by a table screen.
 *
 * Built from a validated TableIndexRequest, so every column name here was
 * checked against the screen's allow-list before reaching the query.
 */
final readonly class TableQuery
{
    /**
     * @param  array<string, string>  $filters  Non-empty filters keyed by filter name.
     */
    public function __construct(
        public int $perPage = 15,
        public ?string $sort = null,
        public string $direction = 'desc',
        public array $filters = [],
        public ?string $dateFrom = null,
        public ?string $dateTo = null,
    ) {}

    /**
     * @param  array{per_page?: int|string|null, sort?: string|null, direction?: string|null, filter?: array<string, mixed>|null, date_from?: string|null, date_to?: string|null}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        $filters = collect($validated['filter'] ?? [])
            ->map(fn (mixed $value): string => trim((string) $value))
            ->filter(fn (string $value): bool => $value !== '')
            ->all();

        return new self(
            perPage: (int) ($validated['per_page'] ?? 15),
            sort: $validated['sort'] ?? null,
            direction: ($validated['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc',
            filters: $filters,
            dateFrom: $validated['date_from'] ?? null,
            dateTo: $validated['date_to'] ?? null,
        );
    }

    public function filter(string $key): ?string
    {
        return $this->filters[$key] ?? null;
    }

    /**
     * "Contains" filters, e.g. ['name' => 'name'] maps filter[name] to the name column.
     * A list of columns matches any of them, e.g. ['sku' => ['sku', 'barcode']].
     *
     * @param  array<string, string|list<string>>  $columns
     */
    public function applyTextFilters(Builder $query, array $columns): self
    {
        foreach ($columns as $filter => $column) {
            $value = $this->filter($filter);

            if ($value === null) {
                continue;
            }

            $pattern = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value).'%';

            $query->where(function (Builder $where) use ($column, $pattern): void {
                foreach ((array) $column as $name) {
                    $where->orWhere($name, 'like', $pattern);
                }
            });
        }

        return $this;
    }

    /**
     * Exact-match filters, e.g. ['status' => 'status', 'brand_id' => 'brand_id'].
     *
     * @param  array<string, string>  $columns
     */
    public function applyExactFilters(Builder $query, array $columns): self
    {
        foreach ($columns as $filter => $column) {
            $value = $this->filter($filter);

            if ($value !== null) {
                $query->where($column, $value);
            }
        }

        return $this;
    }

    /**
     * Period filter. Dates arrive as Manaus calendar days; timestamp columns
     * (stored in UTC) are compared against the matching UTC instants.
     */
    public function applyDateRange(Builder $query, string $column, bool $isTimestamp = false): self
    {
        $timezone = config('app.business_timezone');

        if ($this->dateFrom !== null) {
            $query->where(
                $column,
                '>=',
                $isTimestamp
                    ? Carbon::parse($this->dateFrom, $timezone)->startOfDay()->utc()
                    : $this->dateFrom,
            );
        }

        if ($this->dateTo !== null) {
            $query->where(
                $column,
                '<=',
                $isTimestamp
                    ? Carbon::parse($this->dateTo, $timezone)->endOfDay()->utc()
                    : $this->dateTo,
            );
        }

        return $this;
    }

    /**
     * @param  array<string, string>  $sortable  Sort key => column.
     */
    public function applySort(Builder $query, array $sortable, string $defaultColumn = 'created_at'): self
    {
        $column = $this->sort !== null ? ($sortable[$this->sort] ?? null) : null;

        if ($column === null) {
            $query->orderByDesc($defaultColumn);
        } else {
            $query->orderBy($column, $this->direction);
        }

        // Stable order between pages when the sorted values repeat.
        $query->orderByDesc('id');

        return $this;
    }

    public function paginate(Builder $query): LengthAwarePaginator
    {
        return $query->paginate($this->perPage)->withQueryString();
    }
}
