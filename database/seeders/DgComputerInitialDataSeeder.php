<?php

namespace Database\Seeders;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
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
    }
}
