<?php

namespace App\Http\Requests\Sales\Concerns;

use App\Models\Sale;
use Illuminate\Database\Query\Builder;
use Illuminate\Validation\Rule;

/**
 * Each sale item is either a product or a service, never both. Only active services
 * can be added; on edit a service already in the sale stays valid even if it was
 * deactivated after the sale.
 */
trait ValidatesSaleItems
{
    /**
     * @return array<string, array<int, mixed>>
     */
    protected function itemRules(int $companyId, ?Sale $sale = null): array
    {
        $keptServiceIds = $sale?->items()->whereNotNull('service_id')->pluck('service_id')->all() ?? [];

        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'required_without:items.*.service_id', 'prohibits:items.*.service_id', Rule::exists('products', 'id')->where('company_id', $companyId)],
            'items.*.service_id' => [
                'nullable',
                'integer',
                Rule::exists('services', 'id')
                    ->where('company_id', $companyId)
                    ->where(fn (Builder $query) => $query->where('status', 'active')->orWhereIn('id', $keptServiceIds)),
            ],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.*.product_id.required_without' => 'Escolha um produto ou um serviço para cada item.',
            'items.*.product_id.prohibits' => 'Um item não pode ser produto e serviço ao mesmo tempo.',
            'items.*.service_id.exists' => 'Serviço não encontrado ou inativo.',
        ];
    }
}
