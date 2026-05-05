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
            'status' => $this->status,
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
