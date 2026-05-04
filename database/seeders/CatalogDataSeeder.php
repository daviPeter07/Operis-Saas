<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class CatalogDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'demo@operis.test')->firstOrFail();
        $companyId = (int) $user->current_company_id;

        $brands = collect([
            'Intel',
            'AMD',
            'Kingston',
            'Logitech',
            'Samsung',
        ])->map(
            fn(string $name): Brand => Brand::firstOrCreate(
                ['company_id' => $companyId, 'name' => $name],
                ['status' => 'active']
            )
        );

        $categories = collect([
            'Processadores',
            'Memórias',
            'Periféricos',
            'Armazenamento',
        ])->map(
            fn(string $name): Category => Category::firstOrCreate(
                ['company_id' => $companyId, 'name' => $name],
                ['status' => 'active']
            )
        );

        collect([
            ['name' => 'Distribuidora Norte', 'email' => 'norte@fornecedor.test', 'phone' => '(92) 98888-1111', 'document' => '11222333000144'],
            ['name' => 'Tech Supply', 'email' => 'tech@fornecedor.test', 'phone' => '(92) 97777-2222', 'document' => '22333444000155'],
            ['name' => 'Global Parts', 'email' => 'global@fornecedor.test', 'phone' => '(92) 96666-3333', 'document' => '33444555000166'],
        ])->each(function (array $supplier) use ($companyId): void {
            Supplier::firstOrCreate(
                ['company_id' => $companyId, 'document' => $supplier['document']],
                [
                    'name' => $supplier['name'],
                    'email' => $supplier['email'],
                    'phone' => $supplier['phone'],
                    'status' => 'active',
                ]
            );
        });

        collect([
            ['name' => 'Maria Silva', 'email' => 'maria@cliente.test', 'phone' => '(92) 95555-4444', 'document' => '12345678901'],
            ['name' => 'João Santos', 'email' => 'joao@cliente.test', 'phone' => '(92) 94444-5555', 'document' => '98765432100'],
            ['name' => 'Empresa XPTO', 'email' => 'compras@xpto.test', 'phone' => '(92) 93333-6666', 'document' => '44555666000177'],
        ])->each(function (array $customer) use ($companyId): void {
            Customer::firstOrCreate(
                ['company_id' => $companyId, 'document' => $customer['document']],
                [
                    'name' => $customer['name'],
                    'email' => $customer['email'],
                    'phone' => $customer['phone'],
                    'status' => 'active',
                ]
            );
        });

        $products = [
            [
                'name' => 'Ryzen 5 5600',
                'sku' => 'CPU-R5600',
                'barcode' => '7891000000011',
                'description' => 'Processador AMD Ryzen 5',
                'sale_price' => 980.00,
                'cost' => 750.00,
                'stock' => 20,
                'min_stock' => 5,
                'brand' => 'AMD',
                'category' => 'Processadores',
            ],
            [
                'name' => 'Core i5 12400',
                'sku' => 'CPU-I512400',
                'barcode' => '7891000000028',
                'description' => 'Processador Intel Core i5',
                'sale_price' => 1150.00,
                'cost' => 890.00,
                'stock' => 15,
                'min_stock' => 4,
                'brand' => 'Intel',
                'category' => 'Processadores',
            ],
            [
                'name' => 'SSD 1TB NVMe',
                'sku' => 'SSD-1TB-NVME',
                'barcode' => '7891000000035',
                'description' => 'SSD NVMe de 1TB',
                'sale_price' => 450.00,
                'cost' => 310.00,
                'stock' => 30,
                'min_stock' => 8,
                'brand' => 'Samsung',
                'category' => 'Armazenamento',
            ],
            [
                'name' => 'Memória DDR4 16GB',
                'sku' => 'RAM-16-DDR4',
                'barcode' => '7891000000042',
                'description' => 'Módulo de memória 16GB',
                'sale_price' => 290.00,
                'cost' => 210.00,
                'stock' => 40,
                'min_stock' => 10,
                'brand' => 'Kingston',
                'category' => 'Memórias',
            ],
        ];

        foreach ($products as $product) {
            $brand = $brands->firstWhere('name', $product['brand']);
            $category = $categories->firstWhere('name', $product['category']);

            Product::updateOrCreate(
                ['company_id' => $companyId, 'sku' => $product['sku']],
                [
                    'category_id' => $category?->id,
                    'brand_id' => $brand?->id,
                    'name' => $product['name'],
                    'barcode' => $product['barcode'],
                    'description' => $product['description'],
                    'sale_price' => $product['sale_price'],
                    'cost' => $product['cost'],
                    'stock' => $product['stock'],
                    'min_stock' => $product['min_stock'],
                    'status' => 'active',
                ]
            );
        }
    }
}
