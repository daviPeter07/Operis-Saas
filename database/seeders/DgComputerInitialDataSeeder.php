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
    }
}
