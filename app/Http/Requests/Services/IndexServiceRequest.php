<?php

namespace App\Http\Requests\Services;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexServiceRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['name', 'price', 'cost', 'performed_count', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'id' => ['integer', 'min:1'],
            'name' => ['string', 'max:255'],
            'description' => ['string', 'max:255'],
            'status' => ['in:active,inactive'],
        ];
    }
}
