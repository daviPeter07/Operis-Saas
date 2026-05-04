<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToCompany
{
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }
}
