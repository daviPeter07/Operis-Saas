<?php

namespace App\Http\Requests\Categories;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexCategoryRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['name', 'products_count', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'name' => ['string', 'max:255'],
            'status' => ['in:active,inactive'],
        ];
    }
}
