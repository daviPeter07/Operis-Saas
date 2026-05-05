<?php

namespace App\Http\Resources\Products;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class ProductResource extends ApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'description' => $this->description,
            'sale_price' => $this->sale_price,
            'cost' => $this->cost,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'status' => $this->status,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
