<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LocalFullSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DgComputerInitialDataSeeder::class,
        ]);

        $user = User::query()->where('email', 'ronyconde26@gmail.com')->first();

        if ($user !== null) {
            $user->forceFill([
                'name' => 'Operis Local',
                'email' => 'dev@operis.local',
                'password' => Hash::make('password'),
            ])->save();
        }

        Company::query()
            ->where('document', '34501706000159')
            ->update([
                'name' => 'Operis Local',
                'document' => '00000000000100',
                'address' => 'Ambiente Local',
                'phone' => '92990000000',
                'email' => 'dev@operis.local',
                'city' => 'Manaus',
                'state' => 'AM',
            ]);
    }
}
