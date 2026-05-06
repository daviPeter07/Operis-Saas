<?php

namespace App\Http\Resources\Finance;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class AccountReceivableResource extends ApiResource
{
    private function resolveSaleItemSummary(): ?string
    {
        $sale = $this->sale;

        if (! $sale) {
            return null;
        }

        $items = $sale->items
            ->pluck('product.name')
            ->filter()
            ->unique()
            ->values();

        if ($items->isEmpty()) {
            return null;
        }

        if ($items->count() === 1) {
            return $items->first();
        }

        return sprintf('%s +%d item(ns)', $items->first(), $items->count() - 1);
    }

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
            'sale_id' => $this->sale_id,
            'installment_number' => $this->installment_number,
            'entry_date' => $this->entry_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'item' => $this->item ?? $this->resolveSaleItemSummary(),
            'description' => $this->description,
            'amount' => $this->amount,
            'status' => $this->status,
            'received_at' => $this->received_at,
        ];
    }
}
