<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'category_id',
    'brand_id',
    'name',
    'sku',
    'barcode',
    'description',
    'sale_price',
    'cost',
    'stock',
    'min_stock',
    'status',
])]
class Product extends Model
{
    use BelongsToCompany, HasFactory;

    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'cost' => 'decimal:2',
            'stock' => 'decimal:2',
            'min_stock' => 'decimal:2',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}
