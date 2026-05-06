<?php

namespace App\Http\Requests\Customers;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'document' => ['nullable', 'string', 'max:20'],
            'person_type' => ['nullable', 'string', 'in:pf,pj'],
            'status' => ['sometimes', 'in:active,inactive'],
            'credit_enabled' => ['sometimes', 'boolean'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'credit_term_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }
}
