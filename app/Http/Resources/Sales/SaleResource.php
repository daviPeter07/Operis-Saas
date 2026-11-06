<?php

namespace App\Http\Resources\Sales;

use App\Http\Resources\ApiResource;
use App\Models\SaleEvent;
use Carbon\CarbonInterface;
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
            'customer_name' => $this->customer?->name,
            'date' => $this->date?->toDateString(),
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
            'subtotal' => $this->subtotal,
            'discount' => (float) $this->discount,
            'total' => $this->total,
            'profit' => $this->profitAmount(),
            'status' => $this->status,
            'completed_at' => $this->businessTime($this->completed_at),
            'cancelled_at' => $this->businessTime($this->cancelled_at),
            'delivered_at' => $this->businessTime($this->delivered_at),
            'payment_method' => $this->payment_method,
            'installments' => $this->installments,
            'first_installment_date' => $this->first_installment_date?->toDateString(),
            'installment_value' => $this->installment_value,
            'crediario_entry' => $this->crediario_entry,
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'category_name' => $item->product?->category?->name,
                'brand_name' => $item->product?->brand?->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'unit_cost' => $item->unit_cost,
                'subtotal' => $item->subtotal,
            ])->all()),
            'history' => $this->whenLoaded('events', fn () => $this->events->map(fn (SaleEvent $event): array => [
                'type' => $event->type,
                'occurred_at' => $this->businessTime($event->occurred_at),
                'description' => $event->description,
                'amount' => $event->amount === null ? null : (float) $event->amount,
            ])->all()),
        ];
    }

    private function businessTime(?CarbonInterface $moment): ?string
    {
        return $moment?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s');
    }
}
