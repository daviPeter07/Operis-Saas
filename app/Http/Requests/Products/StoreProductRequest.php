<?php

namespace App\Http\Requests\Products;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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

        return [
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->where('company_id', $companyId)],
            'barcode' => ['nullable', 'string', 'max:80', Rule::unique('products', 'barcode')->where('company_id', $companyId)->whereNotNull('barcode')],
            'description' => ['nullable', 'string'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'numeric'],
            'min_stock' => ['nullable', 'numeric'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('company_id', $companyId)],
            'brand_id' => ['required', 'integer', Rule::exists('brands', 'id')->where('company_id', $companyId)],
        ];
    }
}
