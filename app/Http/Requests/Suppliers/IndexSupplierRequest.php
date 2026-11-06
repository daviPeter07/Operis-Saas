<?php

namespace App\Http\Requests\Suppliers;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexSupplierRequest extends TableIndexRequest
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
            'document' => ['string', 'max:255'],
            'email' => ['string', 'max:255'],
            'phone' => ['string', 'max:255'],
            'person_type' => ['in:pf,pj'],
            'status' => ['in:active,inactive'],
        ];
    }
}
