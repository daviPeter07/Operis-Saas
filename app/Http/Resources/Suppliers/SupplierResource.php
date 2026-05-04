<?php

namespace App\Http\Resources\Suppliers;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class SupplierResource extends ApiResource
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
        ];
    }
}
