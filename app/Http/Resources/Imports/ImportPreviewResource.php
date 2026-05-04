<?php

namespace App\Http\Resources\Imports;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class ImportPreviewResource extends ApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'valid_rows' => $this['valid_rows'] ?? [],
            'invalid_rows' => $this['invalid_rows'] ?? [],
            'duplicates' => $this['duplicates'] ?? [],
        ];
    }
}
