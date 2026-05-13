<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('local')) {
            $this->call([
                LocalQuickSeeder::class,
            ]);

            return;
        }

        $this->call([
            DgComputerInitialDataSeeder::class,
        ]);
    }
}
