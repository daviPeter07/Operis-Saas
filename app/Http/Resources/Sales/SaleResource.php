<?php

namespace App\Http\Resources\Sales;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class SaleResource extends ApiResource
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
            'customer_id' => $this->customer_id,
            'date' => $this->date?->toDateString(),
            'subtotal' => $this->subtotal,
            'total' => $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ])->all()),
        ];
    }
}
