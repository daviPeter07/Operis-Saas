<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'customer_id',
    'sale_id',
    'installment_number',
    'entry_date',
    'due_date',
    'item',
    'description',
    'amount',
    'amount_paid',
    'status',
    'received_at',
])]
class AccountReceivable extends Model
{
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'due_date' => 'date',
            'amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'received_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
