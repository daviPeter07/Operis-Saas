<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'product_id',
    'type',
    'quantity_delta',
    'reference_type',
    'reference_id',
    'notes',
    'created_by',
])]
class StockMovement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity_delta' => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
