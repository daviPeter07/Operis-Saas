<?php

namespace App\Http\Resources\Finance;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class AccountPayableResource extends ApiResource
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
            'purchase_id' => $this->purchase_id,
            'installment_number' => $this->installment_number,
            'due_date' => $this->due_date?->toDateString(),
            'amount' => $this->amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'paid_method' => $this->paid_method,
            'payment_notes' => $this->payment_notes,
        ];
    }
}
