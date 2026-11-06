<?php

namespace App\Http\Requests\Customers;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexCustomerRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['name', 'credit_limit', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'name' => ['string', 'max:255'],
            'document' => ['string', 'max:20'],
            'email' => ['string', 'max:255'],
            'phone' => ['string', 'max:20'],
            'person_type' => ['in:pf,pj'],
            'status' => ['in:active,inactive'],
            'credit_enabled' => ['in:0,1'],
        ];
    }
}
