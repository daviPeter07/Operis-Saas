<?php

namespace App\Http\Requests\Purchases;

use App\Enums\PurchaseStatus;
use App\Http\Requests\Tables\TableIndexRequest;
use Illuminate\Validation\Rule;

class IndexPurchaseRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['date', 'due_date', 'total', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'supplier' => ['string', 'max:255'],
            'product' => ['string', 'max:255'],
            'category_id' => ['integer'],
            'brand_id' => ['integer'],
            'status' => [Rule::enum(PurchaseStatus::class)],
            'payment_method' => [Rule::in(['cash', 'pix', 'card', 'installment', 'boleto'])],
        ];
    }
}
