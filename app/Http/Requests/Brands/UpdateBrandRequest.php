<?php

namespace App\Http\Requests\Brands;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
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
        $companyId = $this->user()->current_company_id;
        $brandId = $this->route('brand')?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('brands', 'name')->where('company_id', $companyId)->ignore($brandId)],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
