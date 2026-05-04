<?php

namespace Database\Seeders;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoCompanySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@operis.test'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );

        $company = Company::firstOrCreate(
            ['document' => '12345678000199'],
            [
                'name' => 'Operis Demo LTDA',
                'document_type' => 'cnpj',
                'address' => 'Rua Operis, 100',
                'phone' => '(92) 99999-0000',
                'email' => 'contato@operis.test',
                'city' => 'Manaus',
                'state' => 'AM',
                'verified_at' => now(),
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
    }
}
