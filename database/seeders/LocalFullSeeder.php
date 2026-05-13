<?php

namespace Database\Seeders;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Enums\FinancialStatus;
use App\Enums\PaymentMethod;
use App\Enums\PurchaseStatus;
use App\Enums\SaleStatus;
use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LocalFullSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $user = User::query()->firstOrCreate(
            ['email' => 'dev@operis.local'],
            [
                'name' => 'Operis Local',
                'password' => Hash::make('password'),
                'email_verified_at' => $now,
            ]
        );

        $company = Company::query()->firstOrCreate(
            ['document' => '00000000000100'],
            [
                'name' => 'Operis Local',
                'document_type' => 'cnpj',
                'address' => 'Ambiente Local',
                'phone' => '92990000000',
                'email' => 'dev@operis.local',
                'city' => 'Manaus',
                'state' => 'AM',
                'verified_at' => $now,
            ]
        );

        CompanyUser::query()->updateOrCreate(
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

        $brands = collect(range(1, 5))->map(function (int $index) use ($company): Brand {
            return Brand::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'name' => sprintf('Marca Local %02d', $index),
                ],
                ['status' => 'active']
            );
        })->values();

        $categories = collect(range(1, 5))->map(function (int $index) use ($company): Category {
            return Category::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'name' => sprintf('Categoria Local %02d', $index),
                ],
                [
                    'parent_id' => null,
                    'status' => 'active',
                ]
            );
        })->values();

        $customers = collect(range(1, 5))->map(function (int $index) use ($company): Customer {
            return Customer::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'document' => sprintf('1000000000%02d', $index),
                ],
                [
                    'name' => sprintf('Cliente Local %02d', $index),
                    'email' => sprintf('cliente%02d@operis.local', $index),
                    'phone' => sprintf('9299100%04d', $index),
                    'person_type' => 'pf',
                    'status' => 'active',
                    'credit_enabled' => $index % 2 === 0,
                    'credit_limit' => $index % 2 === 0 ? 2500 : 0,
                    'credit_term_days' => 30,
                ]
            );
        })->values();

        $suppliers = collect(range(1, 5))->map(function (int $index) use ($company): Supplier {
            return Supplier::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'document' => sprintf('200000000001%02d', $index),
                ],
                [
                    'name' => sprintf('Fornecedor Local %02d', $index),
                    'email' => sprintf('fornecedor%02d@operis.local', $index),
                    'phone' => sprintf('9299200%04d', $index),
                    'person_type' => 'pj',
                    'status' => 'active',
                ]
            );
        })->values();

        $products = collect(range(1, 5))->map(function (int $index) use ($company, $brands, $categories): Product {
            $cost = 25 + ($index * 10);
            $salePrice = $cost + 20;

            return Product::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'sku' => sprintf('LOCAL-SKU-%02d', $index),
                ],
                [
                    'category_id' => $categories[$index - 1]->id,
                    'brand_id' => $brands[$index - 1]->id,
                    'name' => sprintf('Produto Local %02d', $index),
                    'barcode' => sprintf('78900000000%02d', $index),
                    'description' => sprintf('Produto de teste local %02d', $index),
                    'sale_price' => $salePrice,
                    'cost' => $cost,
                    'stock' => 100,
                    'min_stock' => 5,
                    'status' => 'active',
                ]
            );
        })->values();

        collect(range(1, 5))->each(function (int $index) use ($company, $customers, $products): void {
            $product = $products[$index - 1];
            $customer = $customers[$index - 1];
            $quantity = 1 + $index;
            $subtotal = round((float) $product->sale_price * $quantity, 2);

            $sale = Sale::query()->create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'date' => now()->subDays(10 - $index)->toDateString(),
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'status' => SaleStatus::Completed->value,
                'payment_method' => PaymentMethod::Installment->value,
                'installments' => 1,
                'first_installment_date' => now()->subDays(10 - $index)->toDateString(),
                'installment_value' => $subtotal,
                'crediario_entry' => 0,
            ]);

            SaleItem::query()->create([
                'company_id' => $company->id,
                'sale_id' => $sale->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->sale_price,
                'unit_cost' => $product->cost,
                'subtotal' => $subtotal,
            ]);

            AccountReceivable::query()->create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'sale_id' => $sale->id,
                'installment_number' => 1,
                'entry_date' => now()->subDays(10 - $index)->toDateString(),
                'due_date' => now()->addDays($index)->toDateString(),
                'item' => sprintf('Recebível venda #%d', $sale->id),
                'description' => sprintf('Conta a receber gerada para venda local %02d', $index),
                'amount' => $subtotal,
                'status' => FinancialStatus::Pending->value,
                'received_at' => null,
            ]);
        });

        collect(range(1, 5))->each(function (int $index) use ($company, $suppliers, $products): void {
            $product = $products[$index - 1];
            $supplier = $suppliers[$index - 1];
            $quantity = 2 + $index;
            $subtotal = round((float) $product->cost * $quantity, 2);

            $purchase = Purchase::query()->create([
                'company_id' => $company->id,
                'supplier_id' => $supplier->id,
                'date' => now()->subDays(15 - $index)->toDateString(),
                'due_date' => now()->addDays($index + 5)->toDateString(),
                'total' => $subtotal,
                'status' => PurchaseStatus::Pending->value,
                'payment_method' => PaymentMethod::Installment->value,
                'boleto_term_days' => 30,
            ]);

            PurchaseItem::query()->create([
                'company_id' => $company->id,
                'purchase_id' => $purchase->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_cost' => $product->cost,
                'subtotal' => $subtotal,
            ]);

            AccountPayable::query()->create([
                'company_id' => $company->id,
                'supplier_id' => $supplier->id,
                'purchase_id' => $purchase->id,
                'installment_number' => 1,
                'total_installments' => 1,
                'entry_date' => now()->subDays(15 - $index)->toDateString(),
                'item' => sprintf('Pagamento compra #%d', $purchase->id),
                'description' => sprintf('Conta a pagar gerada para compra local %02d', $index),
                'due_date' => now()->addDays($index + 5)->toDateString(),
                'amount' => $subtotal,
                'status' => FinancialStatus::Pending->value,
                'paid_at' => null,
                'paid_method' => null,
                'payment_notes' => null,
            ]);
        });
    }
}
