<?php

namespace App\Http\Requests\Tables;

use App\Support\Tables\TableQuery;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Query string accepted by table listings:
 * ?page=2&per_page=25&sort=sale_price&direction=desc&filter[name]=mouse&date_from=2026-11-01&date_to=2026-11-30
 *
 * Each screen declares which filters and sort keys it accepts.
 */
abstract class TableIndexRequest extends FormRequest
{
    public const MAX_PER_PAGE = 100;

    /**
     * Sort keys accepted by this listing.
     *
     * @return list<string>
     */
    abstract protected function sortable(): array;

    /**
     * Validation rules for each accepted filter, keyed by filter name.
     *
     * @return array<string, array<int, mixed>>
     */
    abstract protected function filterRules(): array;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $filterRules = collect($this->filterRules())
            ->mapWithKeys(fn (array $rules, string $filter): array => ["filter.{$filter}" => ['nullable', ...$rules]])
            ->all();

        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'sort' => ['nullable', 'string', Rule::in($this->sortable())],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'filter' => ['nullable', 'array:'.implode(',', array_keys($this->filterRules()))],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            ...$filterRules,
        ];
    }

    public function tableQuery(): TableQuery
    {
        return TableQuery::fromValidated($this->validated());
    }
}
