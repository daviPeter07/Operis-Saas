<?php

namespace App\Http\Resources\Purchases;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class PurchaseResource extends ApiResource
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
            'supplier_id' => $this->supplier_id,
            'date' => $this->date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'total' => $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'category_name' => $item->product?->category?->name,
                'brand_name' => $item->product?->brand?->name,
                'quantity' => $item->quantity,
                'unit_cost' => $item->unit_cost,
                'subtotal' => $item->subtotal,
            ])->all()),
        ];
    }
}
