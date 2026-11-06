<?php

namespace App\Http\Requests\Sales;

use App\Enums\SaleStatus;
use App\Http\Requests\Tables\TableIndexRequest;
use Illuminate\Validation\Rule;

class IndexSaleRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['date', 'total', 'profit', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'id' => ['integer', 'min:1'],
            'service_id' => ['integer', 'min:1'],
            'customer' => ['string', 'max:255'],
            'product' => ['string', 'max:255'],
            'category_id' => ['integer'],
            'brand_id' => ['integer'],
            'status' => [Rule::enum(SaleStatus::class)],
            'payment_method' => [Rule::in(['cash', 'pix', 'card_debit', 'card_credit', 'crediario', 'card', 'installment'])],
        ];
    }
}
