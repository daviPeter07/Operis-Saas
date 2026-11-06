<?php

namespace App\Http\Requests\Sales\Concerns;

use Illuminate\Validation\Validator;

/**
 * The discount is a value in reais that cannot exceed the items subtotal
 * (sum of quantity x unit price), so the sale total never goes below zero.
 */
trait ValidatesSaleDiscount
{
    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $discount = $this->input('discount');

                if (! is_numeric($discount) || $validator->errors()->has('discount')) {
                    return;
                }

                $subtotal = collect((array) $this->input('items', []))
                    ->filter(fn (mixed $item): bool => is_array($item) && is_numeric($item['quantity'] ?? null) && is_numeric($item['unit_price'] ?? null))
                    ->sum(fn (array $item): float => (float) $item['quantity'] * (float) $item['unit_price']);

                if (round((float) $discount, 2) > round($subtotal, 2)) {
                    $validator->errors()->add('discount', 'O desconto não pode ser maior que o subtotal dos itens.');
                }
            },
        ];
    }
}
