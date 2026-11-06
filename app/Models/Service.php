<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['company_id', 'name', 'description', 'price', 'cost', 'status'])]
class Service extends Model
{
    use BelongsToCompany;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost' => 'decimal:2',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Adds `performed_count`: how many times the service was sold (sum of the
     * quantities), not counting cancelled sales.
     */
    public function scopeWithPerformedCount(Builder $query): Builder
    {
        return $query->withSum(
            ['saleItems as performed_count' => fn (Builder $items) => $items->whereHas('sale', fn (Builder $sale) => $sale->where('status', '!=', 'cancelled'))],
            'quantity',
        );
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
