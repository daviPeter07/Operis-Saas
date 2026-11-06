<?php

namespace App\Http\Requests\Products;

use App\Http\Requests\Tables\TableIndexRequest;

class IndexProductRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function sortable(): array
    {
        return ['name', 'sku', 'cost', 'sale_price', 'stock', 'min_stock', 'created_at'];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function filterRules(): array
    {
        return [
            'id' => ['integer', 'min:1'],
            'name' => ['string', 'max:255'],
            'sku' => ['string', 'max:255'],
            'barcode' => ['string', 'max:255'],
            'brand_id' => ['integer'],
            'category_id' => ['integer'],
            'status' => ['in:active,inactive'],
            'stock_status' => ['in:out_of_stock,below_minimum'],
        ];
    }
}
