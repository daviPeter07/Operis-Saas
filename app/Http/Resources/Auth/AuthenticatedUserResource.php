<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\ApiResource;
use Illuminate\Http\Request;

class AuthenticatedUserResource extends ApiResource
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
            'current_company_id' => $this->current_company_id,
            'current_company' => $this->whenLoaded('currentCompany', fn (): array => [
                'id' => $this->currentCompany->id,
                'name' => $this->currentCompany->name,
                'verified_at' => $this->currentCompany->verified_at,
            ]),
        ];
    }
}
