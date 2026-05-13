<?php

namespace Database\Seeders;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LocalQuickSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $user = User::query()->firstOrCreate(
            ['email' => 'dev@operis.local'],
            [
                'name' => 'Operis Dev',
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
    }
}
