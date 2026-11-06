<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['company_id', 'sale_id', 'product_id', 'service_id', 'quantity', 'unit_price', 'unit_cost', 'subtotal'])]
class SaleItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function isService(): bool
    {
        return $this->service_id !== null;
    }

    /**
     * The product or service name, for receipts, summaries and listings.
     */
    public function displayName(): ?string
    {
        return $this->isService() ? $this->service?->name : $this->product?->name;
    }
}
