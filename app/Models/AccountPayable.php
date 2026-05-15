<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'supplier_id',
    'purchase_id',
    'installment_number',
    'total_installments',
    'entry_date',
    'item',
    'description',
    'due_date',
    'amount',
    'amount_paid',
    'status',
    'paid_at',
    'paid_method',
    'payment_notes',
])]
class AccountPayable extends Model
{
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'entry_date' => 'date',
            'amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
