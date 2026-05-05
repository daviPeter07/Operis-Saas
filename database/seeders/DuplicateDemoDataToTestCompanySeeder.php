<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;

class DuplicateDemoDataToTestCompanySeeder extends Seeder
{
    public function run(): void
    {
        // Find the test user (Davi) and his company
        $testUser = User::where('email', 'davipetersondev173@gmail.com')->firstOrFail();
        $testCompanyId = $testUser->current_company_id;

        // Find the demo company used by existing seeders
        $demoCompany = Company::where('name', 'Operis Demo LTDA')->firstOrFail();
        $demoCompanyId = $demoCompany->id;

        // Duplicate brands
        $demoBrands = Brand::where('company_id', $demoCompanyId)->get();
        foreach ($demoBrands as $brand) {
            Brand::firstOrCreate(
                ['company_id' => $testCompanyId, 'name' => $brand->name],
                ['status' => $brand->status ?? 'active']
            );
        }

        // Duplicate categories
        $demoCategories = Category::where('company_id', $demoCompanyId)->get();
        foreach ($demoCategories as $category) {
            Category::firstOrCreate(
                ['company_id' => $testCompanyId, 'name' => $category->name],
                ['status' => $category->status ?? 'active']
            );
        }

        // Duplicate suppliers
        $demoSuppliers = Supplier::where('company_id', $demoCompanyId)->get();
        foreach ($demoSuppliers as $supplier) {
            Supplier::firstOrCreate(
                ['company_id' => $testCompanyId, 'document' => $supplier->document],
                [
                    'name' => $supplier->name,
                    'email' => $supplier->email,
                    'phone' => $supplier->phone,
                    'status' => $supplier->status ?? 'active',
                ]
            );
        }

        // Duplicate customers
        $demoCustomers = Customer::where('company_id', $demoCompanyId)->get();
        foreach ($demoCustomers as $customer) {
            Customer::firstOrCreate(
                ['company_id' => $testCompanyId, 'document' => $customer->document],
                [
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'status' => $customer->status ?? 'active',
                ]
            );
        }

        // Duplicate products (need brand and category ids for the test company)
        $demoProducts = Product::where('company_id', $demoCompanyId)->get();
        foreach ($demoProducts as $product) {
            // Find corresponding brand and category in the test company (by name)
            $brand = Brand::where('company_id', $testCompanyId)
                ->where('name', optional($product->brand)->name)
                ->first();
            $category = Category::where('company_id', $testCompanyId)
                ->where('name', optional($product->category)->name)
                ->first();

            Product::firstOrCreate(
                ['company_id' => $testCompanyId, 'sku' => $product->sku],
                [
                    'category_id' => $category->id ?? null,
                    'brand_id' => $brand->id ?? null,
                    'name' => $product->name,
                    'barcode' => $product->barcode,
                    'description' => $product->description,
                    'sale_price' => $product->sale_price,
                    'cost' => $product->cost,
                    'stock' => $product->stock,
                    'min_stock' => $product->min_stock,
                    'status' => $product->status ?? 'active',
                ]
            );
        }
    }
}
