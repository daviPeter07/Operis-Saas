<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('local')) {
            $localSeedMode = (string) env('LOCAL_SEED_MODE', 'full');

            $this->call([
                $localSeedMode === 'quick'
                    ? LocalQuickSeeder::class
                    : LocalFullSeeder::class,
            ]);

            return;
        }

        $this->call([
            DgComputerInitialDataSeeder::class,
        ]);
    }
}
