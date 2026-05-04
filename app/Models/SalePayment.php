<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['company_id', 'sale_id', 'method', 'installments_count', 'first_due_date', 'metadata_json'])]
class SalePayment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'first_due_date' => 'date',
            'metadata_json' => 'array',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
