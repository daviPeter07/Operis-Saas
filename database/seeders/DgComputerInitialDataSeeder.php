<?php

namespace Database\Seeders;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Enums\PurchaseStatus;
use App\Enums\SaleStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use App\Services\Purchases\PurchaseService;
use App\Services\Sales\SaleService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DgComputerInitialDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $user = User::firstOrCreate(
            ['email' => 'ronyconde26@gmail.com'],
            [
                'name' => 'Rony Peterson',
                'password' => Hash::make('260197Dg'),
                'email_verified_at' => $now,
            ]
        );

        $company = Company::firstOrCreate(
            ['document' => '34501706000159'],
            [
                'name' => 'DG Computer',
                'document_type' => 'cnpj',
                'address' => 'Rua Paraiso do Norte, 845, Coroado 2',
                'phone' => '92999865111',
                'email' => 'info@dgcomputer.com.br',
                'city' => 'Manaus',
                'state' => 'AM',
                'verified_at' => $now,
            ]
        );

        CompanyUser::updateOrCreate(
            [
                'company_id' => $company->id,
                'user_id' => $user->id,
            ],
            [
                'role' => CompanyUserRole::Owner->value,
                'status' => CompanyUserStatus::Active->value,
            ]
        );

        if ($user->current_company_id !== $company->id) {
            $user->forceFill(['current_company_id' => $company->id])->save();
        }

        foreach (
            [
                'Logitech',
                'Razer',
                'Corsair',
                'Redragon',
                'HyperX',
                'AOC',
                'Samsung',
                'Kingston',
                'Intel',
                'ASUS',
            ] as $brandName
        ) {
            $company->brands()->firstOrCreate(
                ['name' => $brandName],
                ['status' => 'active']
            );
        }

        for ($index = 1; $index <= 30; $index++) {
            $company->brands()->firstOrCreate(
                ['name' => sprintf('Marca DG %02d', $index)],
                ['status' => 'active']
            );
        }

        foreach (
            [
                'Periféricos',
                'Gamer',
                'Informática',
                'Armazenamento',
                'Monitores',
                'Redes',
                'Componentes',
                'Acessórios',
                'Cabos e Adaptadores',
                'Áudio',
            ] as $categoryName
        ) {
            $company->categories()->firstOrCreate(
                ['name' => $categoryName],
                [
                    'parent_id' => null,
                    'status' => 'active',
                ]
            );
        }

        for ($index = 1; $index <= 30; $index++) {
            $company->categories()->firstOrCreate(
                ['name' => sprintf('Categoria DG %02d', $index)],
                [
                    'parent_id' => null,
                    'status' => 'active',
                ]
            );
        }

        $customers = $this->seedCustomers($company);
        $suppliers = $this->seedSuppliers($company);
        $products = $this->seedProducts($company);

        $this->seedDemoSales($company, $user, $customers, $products);
        $this->seedDemoPurchases($company, $user, $suppliers, $products);
    }

    /**
     * @return array{general: Customer, credit: Customer}
     */
    private function seedCustomers(Company $company): array
    {
        $general = Customer::query()->firstOrCreate(
            [
                'company_id' => $company->id,
                'document' => '12345678901',
            ],
            [
                'name' => 'Cliente Geral DG',
                'email' => 'cliente.geral@dgcomputer.com.br',
                'phone' => '92990001001',
                'person_type' => 'pf',
                'status' => 'active',
                'credit_enabled' => false,
                'credit_limit' => 0,
                'credit_term_days' => 30,
            ]
        );

        $credit = Customer::query()->firstOrCreate(
            [
                'company_id' => $company->id,
                'document' => '98765432100',
            ],
            [
                'name' => 'Cliente Crediario DG',
                'email' => 'cliente.crediario@dgcomputer.com.br',
                'phone' => '92990001002',
                'person_type' => 'pf',
                'status' => 'active',
                'credit_enabled' => true,
                'credit_limit' => 5000,
                'credit_term_days' => 120,
            ]
        );

        for ($index = 1; $index <= 30; $index++) {
            $document = sprintf('900000000%02d', $index);

            Customer::query()->firstOrCreate(
                [
                    'company_id' => $company->id,
                    'document' => $document,
                ],
                [
                    'name' => sprintf('Cliente DG %02d', $index),
                    'email' => sprintf('cliente%02d@dgcomputer.com.br', $index),
                    'phone' => sprintf('9299111%04d', $index),
                    'person_type' => 'pf',
                    'status' => 'active',
                    'credit_enabled' => $index % 4 === 0,
                    'credit_limit' => $index % 4 === 0 ? 2000 : 0,
                    'credit_term_days' => 30,
                ]
            );
        }

        return [
            'general' => $general,
            'credit' => $credit,
        ];
    }

    /**
     * @return array<string, Supplier>
     */
    private function seedSuppliers(Company $company): array
    {
        $suppliers = [];

        foreach (
            [
                'cash' => ['name' => 'Atacado Norte', 'document' => '11111111000191'],
                'pix' => ['name' => 'Distribuidora Manaus', 'document' => '22222222000192'],
                'card' => ['name' => 'Tech Supply', 'document' => '33333333000193'],
                'installment' => ['name' => 'Fornecedor Centro', 'document' => '44444444000194'],
                'boleto' => ['name' => 'Importadora Amazon', 'document' => '55555555000195'],
            ] as $key => $supplierData
        ) {
            $suppliers[$key] = Supplier::query()->firstOrCreate(
                [
                    'company_id' => $company->id,
                    'document' => $supplierData['document'],
                ],
                [
                    'name' => $supplierData['name'],
                    'email' => strtolower(str_replace(' ', '.', $supplierData['name'])).'@dgcomputer.com.br',
                    'phone' => '92990002'.substr($supplierData['document'], -2),
                    'person_type' => 'pj',
                    'status' => 'active',
                ]
            );
        }

        for ($index = 1; $index <= 30; $index++) {
            Supplier::query()->firstOrCreate(
                [
                    'company_id' => $company->id,
                    'document' => sprintf('6666666600%03d', $index),
                ],
                [
                    'name' => sprintf('Fornecedor DG %02d', $index),
                    'email' => sprintf('fornecedor%02d@dgcomputer.com.br', $index),
                    'phone' => sprintf('9299222%04d', $index),
                    'person_type' => 'pj',
                    'status' => 'active',
                ]
            );
        }

        return $suppliers;
    }

    /**
     * @return array<string, Product>
     */
    private function seedProducts(Company $company): array
    {
        $brandIds = Brand::query()
            ->where('company_id', $company->id)
            ->pluck('id', 'name');

        $categoryIds = Category::query()
            ->where('company_id', $company->id)
            ->pluck('id', 'name');

        $products = [];

        foreach (
            [
                [
                    'sku' => 'DG-KBD-001',
                    'name' => 'Teclado Mecânico DG',
                    'category' => 'Periféricos',
                    'brand' => 'Corsair',
                    'sale_price' => 189.90,
                    'cost' => 120.00,
                    'stock' => 40,
                    'min_stock' => 5,
                ],
                [
                    'sku' => 'DG-MSE-001',
                    'name' => 'Mouse Gamer DG',
                    'category' => 'Gamer',
                    'brand' => 'Razer',
                    'sale_price' => 89.90,
                    'cost' => 45.00,
                    'stock' => 35,
                    'min_stock' => 5,
                ],
                [
                    'sku' => 'DG-HDS-001',
                    'name' => 'Headset DG Pro',
                    'category' => 'Áudio',
                    'brand' => 'HyperX',
                    'sale_price' => 299.90,
                    'cost' => 175.00,
                    'stock' => 25,
                    'min_stock' => 4,
                ],
                [
                    'sku' => 'DG-MON-001',
                    'name' => 'Monitor 24 DG',
                    'category' => 'Monitores',
                    'brand' => 'AOC',
                    'sale_price' => 899.90,
                    'cost' => 620.00,
                    'stock' => 18,
                    'min_stock' => 3,
                ],
                [
                    'sku' => 'DG-CAB-001',
                    'name' => 'Cabo HDMI DG',
                    'category' => 'Cabos e Adaptadores',
                    'brand' => 'ASUS',
                    'sale_price' => 39.90,
                    'cost' => 12.00,
                    'stock' => 60,
                    'min_stock' => 10,
                ],
            ] as $productData
        ) {
            $products[$productData['sku']] = Product::query()->firstOrCreate(
                [
                    'company_id' => $company->id,
                    'sku' => $productData['sku'],
                ],
                [
                    'category_id' => $categoryIds[$productData['category']] ?? null,
                    'brand_id' => $brandIds[$productData['brand']] ?? null,
                    'name' => $productData['name'],
                    'barcode' => null,
                    'description' => null,
                    'sale_price' => $productData['sale_price'],
                    'cost' => $productData['cost'],
                    'stock' => $productData['stock'],
                    'min_stock' => $productData['min_stock'],
                    'status' => 'active',
                ]
            );
        }

        $brandNames = array_values($brandIds->keys()->all());
        $categoryNames = array_values($categoryIds->keys()->all());

        for ($index = 1; $index <= 60; $index++) {
            $sku = sprintf('DG-PRD-%03d', $index);
            $brandName = $brandNames[$index % count($brandNames)] ?? 'Logitech';
            $categoryName = $categoryNames[$index % count($categoryNames)] ?? 'Periféricos';

            $products[$sku] = Product::query()->firstOrCreate(
                [
                    'company_id' => $company->id,
                    'sku' => $sku,
                ],
                [
                    'category_id' => $categoryIds[$categoryName] ?? null,
                    'brand_id' => $brandIds[$brandName] ?? null,
                    'name' => sprintf('Produto DG %03d', $index),
                    'barcode' => sprintf('78990000%05d', $index),
                    'description' => sprintf('Produto de teste DG %03d', $index),
                    'sale_price' => 49.9 + $index,
                    'cost' => 25 + ($index / 2),
                    'stock' => 20 + $index,
                    'min_stock' => 5,
                    'status' => 'active',
                ]
            );
        }

        return $products;
    }

    /**
     * @param  array{general: Customer, credit: Customer}  $customers
     * @param  array<string, Product>  $products
     */
    private function seedDemoSales(Company $company, User $user, array $customers, array $products): void
    {
        if (Sale::query()->where('company_id', $company->id)->exists()) {
            return;
        }

        $saleService = app(SaleService::class);

        $today = now()->toDateString();

        $saleService->create($company->id, $user->id, [
            'customer_id' => $customers['general']->id,
            'date' => $today,
            'status' => SaleStatus::Completed->value,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $products['DG-KBD-001']->id, 'quantity' => 1, 'unit_price' => 189.90],
                ['product_id' => $products['DG-CAB-001']->id, 'quantity' => 2, 'unit_price' => 39.90],
            ],
        ]);

        $saleService->create($company->id, $user->id, [
            'customer_id' => $customers['general']->id,
            'date' => $today,
            'status' => SaleStatus::Completed->value,
            'payment_method' => 'pix',
            'items' => [
                ['product_id' => $products['DG-MSE-001']->id, 'quantity' => 2, 'unit_price' => 89.90],
            ],
        ]);

        $saleService->create($company->id, $user->id, [
            'customer_id' => $customers['general']->id,
            'date' => $today,
            'status' => SaleStatus::Completed->value,
            'payment_method' => 'card_debit',
            'items' => [
                ['product_id' => $products['DG-HDS-001']->id, 'quantity' => 1, 'unit_price' => 299.90],
            ],
        ]);

        $saleService->create($company->id, $user->id, [
            'customer_id' => $customers['general']->id,
            'date' => $today,
            'status' => SaleStatus::Completed->value,
            'payment_method' => 'card_credit',
            'installments' => 3,
            'first_installment_date' => now()->addDays(30)->toDateString(),
            'items' => [
                ['product_id' => $products['DG-MON-001']->id, 'quantity' => 1, 'unit_price' => 899.90],
            ],
        ]);

        $saleService->create($company->id, $user->id, [
            'customer_id' => $customers['credit']->id,
            'date' => $today,
            'payment_method' => 'crediario',
            'crediario_entry' => 50,
            'installments' => 4,
            'items' => [
                ['product_id' => $products['DG-KBD-001']->id, 'quantity' => 2, 'unit_price' => 189.90],
                ['product_id' => $products['DG-MSE-001']->id, 'quantity' => 1, 'unit_price' => 89.90],
            ],
        ]);

        $customerIds = Customer::query()->where('company_id', $company->id)->pluck('id')->values();
        $productCollection = collect($products)->values();
        $paymentMethods = ['cash', 'pix', 'card_debit', 'card_credit'];

        for ($index = 1; $index <= 35; $index++) {
            $product = $productCollection[$index % max($productCollection->count(), 1)];
            $paymentMethod = $paymentMethods[$index % count($paymentMethods)];
            $status = $index % 5 === 0 ? SaleStatus::Pending->value : SaleStatus::Completed->value;

            $payload = [
                'customer_id' => $customerIds[$index % max($customerIds->count(), 1)] ?? $customers['general']->id,
                'date' => now()->subDays($index)->toDateString(),
                'status' => $status,
                'payment_method' => $paymentMethod,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => ($index % 3) + 1,
                        'unit_price' => (float) $product->sale_price,
                    ],
                ],
            ];

            if ($paymentMethod === 'card_credit') {
                $payload['installments'] = 3;
                $payload['first_installment_date'] = now()->addDays(30)->toDateString();
            }

            $saleService->create($company->id, $user->id, $payload);
        }
    }

    /**
     * @param  array<string, Supplier>  $suppliers
     * @param  array<string, Product>  $products
     */
    private function seedDemoPurchases(Company $company, User $user, array $suppliers, array $products): void
    {
        if (Purchase::query()->where('company_id', $company->id)->exists()) {
            return;
        }

        $purchaseService = app(PurchaseService::class);
        $today = now()->toDateString();

        $purchaseService->create($company->id, $user->id, [
            'supplier_id' => $suppliers['cash']->id,
            'date' => $today,
            'status' => PurchaseStatus::Completed->value,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $products['DG-KBD-001']->id, 'quantity' => 4, 'unit_cost' => 110],
            ],
        ]);

        $purchaseService->create($company->id, $user->id, [
            'supplier_id' => $suppliers['pix']->id,
            'date' => $today,
            'status' => PurchaseStatus::Pending->value,
            'payment_method' => 'pix',
            'items' => [
                ['product_id' => $products['DG-MSE-001']->id, 'quantity' => 6, 'unit_cost' => 40],
            ],
        ]);

        $purchaseService->create($company->id, $user->id, [
            'supplier_id' => $suppliers['card']->id,
            'date' => $today,
            'status' => PurchaseStatus::Completed->value,
            'payment_method' => 'card',
            'items' => [
                ['product_id' => $products['DG-HDS-001']->id, 'quantity' => 3, 'unit_cost' => 160],
            ],
        ]);

        $purchaseService->create($company->id, $user->id, [
            'supplier_id' => $suppliers['installment']->id,
            'date' => $today,
            'status' => PurchaseStatus::Pending->value,
            'payment_method' => 'installment',
            'items' => [
                ['product_id' => $products['DG-MON-001']->id, 'quantity' => 2, 'unit_cost' => 560],
            ],
        ]);

        $purchaseService->create($company->id, $user->id, [
            'supplier_id' => $suppliers['boleto']->id,
            'date' => $today,
            'status' => PurchaseStatus::Pending->value,
            'payment_method' => 'boleto',
            'boleto_term_days' => 60,
            'items' => [
                ['product_id' => $products['DG-CAB-001']->id, 'quantity' => 20, 'unit_cost' => 8],
            ],
        ]);

        $supplierIds = Supplier::query()->where('company_id', $company->id)->pluck('id')->values();
        $productCollection = collect($products)->values();
        $paymentMethods = ['cash', 'pix', 'card', 'installment', 'boleto'];

        for ($index = 1; $index <= 35; $index++) {
            $product = $productCollection[$index % max($productCollection->count(), 1)];
            $paymentMethod = $paymentMethods[$index % count($paymentMethods)];

            $payload = [
                'supplier_id' => $supplierIds[$index % max($supplierIds->count(), 1)] ?? $suppliers['cash']->id,
                'date' => now()->subDays($index)->toDateString(),
                'status' => $index % 4 === 0 ? PurchaseStatus::Pending->value : PurchaseStatus::Completed->value,
                'payment_method' => $paymentMethod,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => ($index % 5) + 1,
                        'unit_cost' => (float) $product->cost,
                    ],
                ],
            ];

            if ($paymentMethod === 'boleto') {
                $payload['boleto_term_days'] = 60;
            }

            $purchaseService->create($company->id, $user->id, $payload);
        }
    }
}
