<?php

namespace App\Http\Requests\Sales;

use App\Http\Requests\Sales\Concerns\ValidatesSaleDiscount;
use App\Http\Requests\Sales\Concerns\ValidatesSaleItems;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    use ValidatesSaleDiscount, ValidatesSaleItems;

    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->user()->current_company_id;

        return [
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('company_id', $companyId)],
            'date' => ['required', 'date'],
            'status' => ['sometimes', 'in:pending,completed'],
            'payment_method' => ['required', 'in:cash,pix,card_debit,card_credit,crediario'],
            'installments' => ['nullable', 'integer', 'min:1', 'max:24'],
            'first_installment_date' => ['nullable', 'date'],
            'installment_value' => ['nullable', 'numeric', 'min:0'],
            'crediario_entry' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'delivered' => ['sometimes', 'boolean'],
            'paid_installments' => ['nullable', 'array'],
            'paid_installments.*' => ['integer', 'min:1', 'max:24'],
            'allow_negative_stock' => ['sometimes', 'boolean'],
            ...$this->itemRules($companyId, null),
        ];
    }
}
