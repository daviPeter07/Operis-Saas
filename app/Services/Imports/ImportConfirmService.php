<?php

namespace App\Services\Imports;

use App\Enums\ImportStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\ImportBatch;
use App\Models\Product;
use App\Models\Supplier;

class ImportConfirmService
{
    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array{created: int, updated: int}
     */
    public function confirm(string $module, int $companyId, int $userId, string $strategy, array $rows): array
    {
        $created = 0;
        $updated = 0;

        foreach ($rows as $row) {
            $result = $this->persistRow($module, $companyId, $strategy, $row);
            $created += $result['created'];
            $updated += $result['updated'];
        }

        ImportBatch::query()->create([
            'company_id' => $companyId,
            'module' => $module,
            'file_name' => 'inline-preview',
            'status' => ImportStatus::Confirmed->value,
            'summary_json' => ['created' => $created, 'updated' => $updated],
            'created_by' => $userId,
        ]);

        return compact('created', 'updated');
    }

    /**
     * @return array{created:int,updated:int}
     */
    private function persistRow(string $module, int $companyId, string $strategy, array $row): array
    {
        return match ($module) {
            'customers' => $this->upsert($this->findByDocumentOrEmail(Customer::class, $companyId, $row), Customer::class, $companyId, $strategy, $row),
            'suppliers' => $this->upsert($this->findByDocumentOrEmail(Supplier::class, $companyId, $row), Supplier::class, $companyId, $strategy, $row),
            'brands' => $this->upsert(Brand::query()->where('company_id', $companyId)->where('name', $row['name'])->first(), Brand::class, $companyId, $strategy, $row),
            'categories' => $this->upsert(Category::query()->where('company_id', $companyId)->where('name', $row['name'])->first(), Category::class, $companyId, $strategy, $row),
            'products' => $this->upsert($this->findBySkuOrBarcode(Product::class, $companyId, $row), Product::class, $companyId, $strategy, $row),
            default => ['created' => 0, 'updated' => 0],
        };
    }

    /**
     * @param  class-string  $model
     * @return object|null
     */
    private function findByDocumentOrEmail(string $model, int $companyId, array $row)
    {
        $document = $row['document'] ?? null;
        $email = $row['email'] ?? null;

        if ($document === null && $email === null) {
            return null;
        }

        return $model::query()->where('company_id', $companyId)
            ->where(function ($q) use ($document, $email): void {
                if ($document !== null) {
                    $q->orWhere('document', $document);
                }
                if ($email !== null) {
                    $q->orWhere('email', $email);
                }
            })
            ->first();
    }

    /**
     * @param  class-string  $model
     * @return object|null
     */
    private function findBySkuOrBarcode(string $model, int $companyId, array $row)
    {
        $sku = $row['sku'] ?? null;
        $barcode = $row['barcode'] ?? null;

        if ($sku === null && $barcode === null) {
            return null;
        }

        return $model::query()->where('company_id', $companyId)
            ->where(function ($q) use ($sku, $barcode): void {
                if ($sku !== null) {
                    $q->where('sku', $sku);
                }
                if ($barcode !== null) {
                    $q->orWhere('barcode', $barcode);
                }
            })
            ->first();
    }

    /**
     * @param  object|null  $existing
     * @return array{created:int,updated:int}
     */
    private function upsert($existing, string $modelClass, int $companyId, string $strategy, array $row): array
    {
        if ($existing) {
            if ($strategy === 'update') {
                $existing->update($this->normalizePayload($modelClass, $row));

                return ['created' => 0, 'updated' => 1];
            }

            return ['created' => 0, 'updated' => 0];
        }

        $modelClass::query()->create([
            ...$this->normalizePayload($modelClass, $row),
            'company_id' => $companyId,
            'status' => $row['status'] ?? 'active',
        ]);

        return ['created' => 1, 'updated' => 0];
    }

    /**
     * @return array<string,mixed>
     */
    private function normalizePayload(string $modelClass, array $row): array
    {
        if ($modelClass === Product::class) {
            return [
                'name' => $row['name'],
                'sku' => $row['sku'],
                'barcode' => $row['barcode'] ?? null,
                'description' => $row['description'] ?? null,
                'sale_price' => (float) $row['sale_price'],
                'cost' => (float) $row['cost'],
                'stock' => (float) $row['stock'],
                'min_stock' => isset($row['min_stock']) ? (float) $row['min_stock'] : null,
                'category_id' => (int) $row['category_id'],
                'brand_id' => (int) $row['brand_id'],
            ];
        }

        if ($modelClass === Brand::class || $modelClass === Category::class) {
            return [
                'name' => $row['name'],
            ];
        }

        return [
            'name' => $row['name'],
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'document' => $row['document'] ?? null,
        ];
    }
}
