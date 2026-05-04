<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DemoCompanySeeder::class,
            CatalogDataSeeder::class,
            TransactionDataSeeder::class,
        ]);
    }
}
