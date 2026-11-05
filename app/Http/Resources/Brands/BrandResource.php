<?php

namespace App\Http\Resources\Brands;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class BrandResource extends ApiResource
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
            'status' => $this->status,
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
        ];
    }
}
