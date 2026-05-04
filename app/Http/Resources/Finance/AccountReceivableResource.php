<?php

namespace App\Http\Resources\Finance;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class AccountReceivableResource extends ApiResource
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
            'sale_id' => $this->sale_id,
            'installment_number' => $this->installment_number,
            'due_date' => $this->due_date?->toDateString(),
            'amount' => $this->amount,
            'status' => $this->status,
            'received_at' => $this->received_at,
        ];
    }
}
