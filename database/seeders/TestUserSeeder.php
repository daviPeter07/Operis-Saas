<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
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
            ['name' => 'Empresa Demo'],
            [
                'document_type' => 'pj',
                'document' => '12.345.678/0001-90',
                'address' => 'Rua Example, 123',
                'email' => 'contato@empresademo.com.br',
                'phone' => '(11) 99999-9999',
                'city' => 'São Paulo',
                'state' => 'SP',
            ]
        );

        CompanyUser::firstOrCreate(
            [
                'user_id' => $user->id,
                'company_id' => $company->id,
            ],
            [
                'role' => 'owner',
                'status' => 'active',
            ]
        );

        if (!$user->current_company_id) {
            $user->current_company_id = $company->id;
            $user->save();
        }
    }
}
