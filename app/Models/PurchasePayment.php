<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['company_id', 'purchase_id', 'method', 'installments_count', 'first_due_date', 'metadata_json'])]
class PurchasePayment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'first_due_date' => 'date',
            'metadata_json' => 'array',
        ];
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }
}
