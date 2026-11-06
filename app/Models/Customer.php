<?php

namespace App\Models;

use App\Enums\FinancialStatus;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'email',
    'phone',
    'document',
    'person_type',
    'status',
    'credit_enabled',
    'credit_limit',
    'credit_term_days',
])]
class Customer extends Model
{
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'credit_enabled' => 'boolean',
            'credit_limit' => 'decimal:2',
            'credit_term_days' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Receivables still counting against the store credit limit.
     */
    public function openReceivables(): HasMany
    {
        return $this->hasMany(AccountReceivable::class)
            ->whereNotIn('status', [FinancialStatus::Received->value, FinancialStatus::Cancelled->value]);
    }
}
