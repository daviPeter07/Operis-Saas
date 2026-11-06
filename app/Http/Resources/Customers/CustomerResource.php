<?php

namespace App\Http\Resources\Customers;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class CustomerResource extends ApiResource
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
            'email' => $this->email,
            'phone' => $this->phone,
            'document' => $this->document,
            'person_type' => $this->person_type,
            'status' => $this->status,
            'credit_enabled' => $this->credit_enabled,
            'credit_limit' => $this->credit_limit,
            'credit_term_days' => $this->credit_term_days,
            'open_balance' => $this->whenHas('open_balance', fn ($value): float => (float) $value),
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
        ];
    }
}
