<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class AccountPayableSettleRequest extends FormRequest
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
        return [
            'paid_at' => ['required', 'date'],
            'paid_method' => ['required', 'in:cash,pix,card,installment'],
            'payment_notes' => ['nullable', 'string'],
        ];
    }
}
