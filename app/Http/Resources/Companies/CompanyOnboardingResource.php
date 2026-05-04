<?php

namespace App\Http\Resources\Companies;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class CompanyOnboardingResource extends ApiResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'document_type' => $this->document_type,
            'document' => $this->document,
            'verified_at' => $this->verified_at,
        ];
    }
}
