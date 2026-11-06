<?php

namespace App\Http\Requests\Brands;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexBrandRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['name', 'created_at'];
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
