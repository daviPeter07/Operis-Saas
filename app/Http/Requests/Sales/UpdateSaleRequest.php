<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSaleRequest extends FormRequest
{
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
            'paid_installments' => ['nullable', 'array'],
            'paid_installments.*' => ['integer', 'min:1', 'max:24'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('company_id', $companyId)],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
