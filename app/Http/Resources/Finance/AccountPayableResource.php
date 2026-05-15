<?php

namespace App\Http\Resources\Finance;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class AccountPayableResource extends ApiResource
{
    private function resolveItem(): ?string
    {
        if ($this->item) {
            return $this->item;
        }

        if (! $this->purchase_id) {
            return null;
        }

        return sprintf('Compra #%d', $this->purchase_id);
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
            'supplier_id' => $this->supplier_id,
            'purchase_id' => $this->purchase_id,
            'installment_number' => $this->installment_number,
            'total_installments' => $this->total_installments,
            'entry_date' => $this->entry_date?->toDateString(),
            'item' => $this->resolveItem(),
            'description' => $this->description,
            'due_date' => $this->due_date?->toDateString(),
            'amount' => $this->amount,
            'amount_paid' => $this->amount_paid,
            'remaining_balance' => max(0, (float) $this->amount - (float) ($this->amount_paid ?? 0)),
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'paid_method' => $this->paid_method,
            'payment_notes' => $this->payment_notes,
        ];
    }
}
