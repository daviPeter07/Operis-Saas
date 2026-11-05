<?php

namespace App\Http\Resources\Categories;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class CategoryResource extends ApiResource
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
            'parent_id' => $this->parent_id,
            'status' => $this->status,
            'createdAt' => $this->created_at?->clone()->setTimezone(config('app.business_timezone'))->format('Y-m-d H:i:s'),
        ];
    }
}
