<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'customer_id',
    'date',
    'subtotal',
    'discount',
    'total',
    'status',
    'payment_method',
    'installments',
    'first_installment_date',
    'installment_value',
    'crediario_entry',
])]
class Sale extends Model
{
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'installments' => 'integer',
            'first_installment_date' => 'date',
            'installment_value' => 'decimal:2',
            'crediario_entry' => 'decimal:2',
        ];
    }

    /**
     * Adds the `profit` column: what the items earn over their cost, minus the discount.
     * Computed in SQL so listings can sort and paginate by it.
     */
    public function scopeWithProfit(Builder $query): void
    {
        if ($query->getQuery()->columns === null) {
            $query->select('sales.*');
        }

        $query->selectRaw(
            '(select coalesce(sum(sale_items.quantity * (sale_items.unit_price - sale_items.unit_cost)), 0)'
            .' from sale_items where sale_items.sale_id = sales.id) - sales.discount as profit'
        );
    }

    /**
     * Same formula as scopeWithProfit, reusing the SQL value when the query selected it.
     */
    public function profitAmount(): float
    {
        if (array_key_exists('profit', $this->getAttributes())) {
            return round((float) $this->getAttributes()['profit'], 2);
        }

        $items = $this->relationLoaded('items') ? $this->items : $this->items()->get();
        $margin = $items->sum(fn (SaleItem $item): float => (float) $item->quantity * ((float) $item->unit_price - (float) $item->unit_cost));

        return round($margin - (float) $this->discount, 2);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SalePayment::class);
    }

    public function receivables(): HasMany
    {
        return $this->hasMany(AccountReceivable::class);
    }
}
