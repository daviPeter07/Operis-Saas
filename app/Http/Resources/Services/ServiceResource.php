<?php

namespace App\Http\Resources\Services;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class ServiceResource extends ApiResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'cost' => $this->cost === null ? null : (float) $this->cost,
            'status' => $this->status,
            'performed_count' => (float) ($this->performed_count ?? 0),
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
        ];
    }
}
