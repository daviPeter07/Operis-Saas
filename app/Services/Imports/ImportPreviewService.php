<?php

namespace App\Services\Imports;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\UploadedFile;

class ImportPreviewService
{
    public function __construct(private readonly ImportParserService $parser) {}

    /**
     * @return array{valid_rows: array<int, array<string, mixed>>, invalid_rows: array<int, array<string, mixed>>, duplicates: array<int, array<string, mixed>>}
     */
    public function preview(string $module, int $companyId, UploadedFile $file): array
    {
        $rows = $this->parser->parse($file);
        $validRows = [];
        $invalidRows = [];
        $duplicates = [];

        foreach ($rows as $line => $row) {
            $errors = $this->validateRow($module, $row);
            if ($errors !== []) {
                $invalidRows[] = ['line' => $line + 2, 'row' => $row, 'errors' => $errors];

                continue;
            }

            if ($this->isDuplicate($module, $companyId, $row)) {
                $duplicates[] = ['line' => $line + 2, 'row' => $row];

                continue;
            }

            $validRows[] = $row;
        }

        return [
            'valid_rows' => $validRows,
            'invalid_rows' => $invalidRows,
            'duplicates' => $duplicates,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function validateRow(string $module, array $row): array
    {
        $required = match ($module) {
            'customers', 'suppliers' => ['name'],
            'brands', 'categories' => ['name'],
            'products' => ['name', 'sku', 'sale_price', 'cost', 'stock', 'category_id', 'brand_id'],
            default => [],
        };

        $errors = [];
        foreach ($required as $field) {
            if (! isset($row[$field]) || $row[$field] === '') {
                $errors[] = "Campo obrigatorio: {$field}";
            }
        }

        return $errors;
    }

    private function isDuplicate(string $module, int $companyId, array $row): bool
    {
        return match ($module) {
            'customers' => $this->existsByDocumentOrEmail(Customer::class, $companyId, $row),
            'suppliers' => $this->existsByDocumentOrEmail(Supplier::class, $companyId, $row),
            'brands' => Brand::query()->where('company_id', $companyId)->where('name', $row['name'])->exists(),
            'categories' => Category::query()->where('company_id', $companyId)->where('name', $row['name'])->exists(),
            'products' => $this->existsBySkuOrBarcode(Product::class, $companyId, $row),
            default => false,
        };
    }

    /**
     * @param  class-string  $model
     */
    private function existsByDocumentOrEmail(string $model, int $companyId, array $row): bool
    {
        $document = $row['document'] ?? null;
        $email = $row['email'] ?? null;

        if ($document === null && $email === null) {
            return false;
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
            ->exists();
    }

    /**
     * @param  class-string  $model
     */
    private function existsBySkuOrBarcode(string $model, int $companyId, array $row): bool
    {
        $sku = $row['sku'] ?? null;
        $barcode = $row['barcode'] ?? null;

        if ($sku === null && $barcode === null) {
            return false;
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
            ->exists();
    }
}
