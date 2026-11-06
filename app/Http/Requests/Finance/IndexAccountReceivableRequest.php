<?php

namespace App\Http\Requests\Finance;

use App\Http\Requests\Tables\TableIndexRequest;
use Illuminate\Validation\Rule;

class IndexAccountReceivableRequest extends TableIndexRequest
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
            'customer' => ['string', 'max:255'],
            'description' => ['string', 'max:255'],
            'sale' => ['integer'],
            'origin' => [Rule::in(['sale', 'manual'])],
            // overdue: open (pending/partial) and past due, the "vencidas" of Visão Geral.
            'status' => [Rule::in(['pending', 'partial', 'received', 'cancelled', 'overdue'])],
        ];
    }
}
