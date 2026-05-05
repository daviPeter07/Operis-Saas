<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Enums\PurchaseStatus;
use App\Enums\SaleStatus;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use App\Services\Purchases\PurchaseService;
use App\Services\Sales\SaleService;
use Illuminate\Database\Seeder;

class TransactionDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'demo@operis.test')->firstOrFail();
        $companyId = (int) $user->current_company_id;

        $customers = Customer::query()->where('company_id', $companyId)->get()->keyBy('name');
        $suppliers = Supplier::query()->where('company_id', $companyId)->get()->keyBy('name');
        $products = Product::query()->where('company_id', $companyId)->get()->keyBy('sku');

        /** @var PurchaseService $purchaseService */
        $purchaseService = app(PurchaseService::class);
        /** @var SaleService $saleService */
        $saleService = app(SaleService::class);

        $this->seedPurchases($purchaseService, $user->id, $companyId, $suppliers->all(), $products->all());
        $this->seedSales($saleService, $user->id, $companyId, $customers->all(), $products->all());
    }

    /**
     * @param  array<string, Supplier>  $suppliers
     * @param  array<string, Product>  $products
     */
    private function seedPurchases(
        PurchaseService $purchaseService,
        int $userId,
        int $companyId,
        array $suppliers,
        array $products
    ): void {
        $purchaseSeed = [
            [
                'date' => '2026-05-01',
                'due_date' => '2026-05-10',
                'supplier' => 'Distribuidora Norte',
                'status' => PurchaseStatus::Completed->value,
                'payment_method' => PaymentMethod::Pix->value,
                'items' => [
                    ['sku' => 'CPU-R5600', 'quantity' => 5, 'unit_cost' => 740.00],
                    ['sku' => 'RAM-16-DDR4', 'quantity' => 10, 'unit_cost' => 205.00],
                ],
            ],
            [
                'date' => '2026-05-02',
                'due_date' => '2026-05-15',
                'supplier' => 'Tech Supply',
                'status' => PurchaseStatus::Pending->value,
                'payment_method' => PaymentMethod::Installment->value,
                'items' => [
                    ['sku' => 'SSD-1TB-NVME', 'quantity' => 12, 'unit_cost' => 300.00],
                ],
            ],
        ];

        foreach ($purchaseSeed as $payload) {
            $alreadyExists = Purchase::query()
                ->where('company_id', $companyId)
                ->whereDate('date', '=', $payload['date'], 'and')
                ->exists();

            if ($alreadyExists) {
                continue;
            }

            $supplier = $suppliers[$payload['supplier']] ?? null;
            $items = collect($payload['items'])
                ->map(fn (array $item): array => [
                    'product_id' => ($products[$item['sku']] ?? null)?->id,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                ])
                ->filter(fn (array $item): bool => ! empty($item['product_id']))
                ->values()
                ->all();

            if ($items === []) {
                continue;
            }

            $purchaseService->create($companyId, $userId, [
                'supplier_id' => $supplier?->id,
                'date' => $payload['date'],
                'due_date' => $payload['due_date'],
                'status' => $payload['status'],
                'payment_method' => $payload['payment_method'],
                'items' => $items,
                'update_product_cost' => true,
            ]);
        }
    }

    /**
     * @param  array<string, Customer>  $customers
     * @param  array<string, Product>  $products
     */
    private function seedSales(
        SaleService $saleService,
        int $userId,
        int $companyId,
        array $customers,
        array $products
    ): void {
        $saleSeed = [
            [
                'date' => '2026-05-03',
                'customer' => 'Maria Silva',
                'status' => SaleStatus::Completed->value,
                'payment_method' => PaymentMethod::Pix->value,
                'items' => [
                    ['sku' => 'CPU-R5600', 'quantity' => 1, 'unit_price' => 980.00],
                    ['sku' => 'RAM-16-DDR4', 'quantity' => 2, 'unit_price' => 290.00],
                ],
            ],
            [
                'date' => '2026-05-04',
                'customer' => 'Empresa XPTO',
                'status' => SaleStatus::Pending->value,
                'payment_method' => PaymentMethod::Installment->value,
                'items' => [
                    ['sku' => 'SSD-1TB-NVME', 'quantity' => 3, 'unit_price' => 450.00],
                ],
            ],
            [
                'date' => '2026-05-05',
                'customer' => 'João Santos',
                'status' => SaleStatus::Completed->value,
                'payment_method' => PaymentMethod::Cash->value,
                'items' => [
                    ['sku' => 'CPU-I512400', 'quantity' => 1, 'unit_price' => 1150.00],
                ],
            ],
        ];

        foreach ($saleSeed as $payload) {
            $alreadyExists = Sale::query()
                ->where('company_id', $companyId)
                ->whereDate('date', '=', $payload['date'], 'and')
                ->exists();

            if ($alreadyExists) {
                continue;
            }

            $customer = $customers[$payload['customer']] ?? null;
            $items = collect($payload['items'])
                ->map(fn (array $item): array => [
                    'product_id' => ($products[$item['sku']] ?? null)?->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ])
                ->filter(fn (array $item): bool => ! empty($item['product_id']))
                ->values()
                ->all();

            if ($items === []) {
                continue;
            }

            $saleService->create($companyId, $userId, [
                'customer_id' => $customer?->id,
                'date' => $payload['date'],
                'status' => $payload['status'],
                'payment_method' => $payload['payment_method'],
                'items' => $items,
            ]);
        }
    }
}
