<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'logo',
    'document_type',
    'document',
    'address',
    'phone',
    'email',
    'city',
    'state',
    'verified_at',
])]
class Company extends Model
{
    use HasFactory;

    public function users(): HasMany
    {
        return $this->hasMany(CompanyUser::class);
    }
}
