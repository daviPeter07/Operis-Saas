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
            'supplier_name' => $this->whenLoaded('supplier', fn () => $this->supplier?->name),
            'date' => $this->date?->toDateString(),
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
            'due_date' => $this->due_date?->toDateString(),
            'total' => $this->total,
            'status' => $this->status,
            'completed_at' => $this->businessTime($this->completed_at),
            'cancelled_at' => $this->businessTime($this->cancelled_at),
            'payment_method' => $this->payment_method,
            'boleto_term_days' => $this->boleto_term_days,
            'notes' => $this->notes,
            'history' => $this->whenLoaded('events', fn () => $this->events->map(fn ($event): array => [
                'type' => $event->type,
                'occurred_at' => $this->businessTime($event->occurred_at),
                'description' => $event->description,
                'amount' => $event->amount === null ? null : (float) $event->amount,
            ])->all()),
            'payables' => $this->whenLoaded('payables', fn () => $this->payables
                ->sortBy('installment_number')
                ->values()
                ->map(fn ($payable): array => [
                    'id' => $payable->id,
                    'installment_number' => $payable->installment_number,
                    'total_installments' => $payable->total_installments,
                    'due_date' => $payable->due_date?->toDateString(),
                    'amount' => $payable->amount,
                    'amount_paid' => $payable->amount_paid,
                    'status' => $payable->status,
                    'paid_at' => $payable->paid_at?->toIso8601String(),
                ])->all()),
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
