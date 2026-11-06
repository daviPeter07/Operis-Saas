<?php

namespace App\Http\Requests\Finance;

use App\Http\Requests\Tables\TableIndexRequest;
use Illuminate\Validation\Rule;

class IndexAccountPayableRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['amount', 'due_date', 'entry_date', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'supplier' => ['string', 'max:255'],
            'description' => ['string', 'max:255'],
            'purchase' => ['integer'],
            'origin' => [Rule::in(['purchase', 'manual'])],
            'status' => [Rule::in(['pending', 'partial', 'paid', 'cancelled'])],
        ];
    }
}
