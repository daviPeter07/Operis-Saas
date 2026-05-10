<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountPayableRequest extends FormRequest
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
            'supplier_id' => ['required', 'integer', Rule::exists('suppliers', 'id')->where('company_id', $companyId)],
            'item' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'entry_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:entry_date'],
            'payment_method' => ['required', 'in:cash,pix,card,installment,boleto'],
            'boleto_term_days' => ['nullable', 'integer', 'in:30,60,90,120'],
            'status' => ['required', 'in:pending,paid'],
        ];
    }
}
