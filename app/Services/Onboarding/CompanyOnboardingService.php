<?php

namespace App\Services\Onboarding;

use App\Enums\CompanyUserRole;
use App\Enums\CompanyUserStatus;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\CompanyVerificationCode;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CompanyOnboardingService
{
    public function createCompany(User $user, array $data): Company
    {
        return DB::transaction(function () use ($user, $data): Company {
            $document = preg_replace('/\D+/', '', (string) $data['document']) ?? '';
            $documentType = $this->resolveDocumentType($document);

            if (! $documentType) {
                throw ValidationException::withMessages([
                    'document' => 'Documento invalido. Informe um CPF ou CNPJ valido.',
                ]);
            }

            $company = Company::query()->create([
                'name' => $data['name'],
                'logo' => $data['logo'] ?? null,
                'document_type' => $documentType,
                'document' => $document,
                'address' => $data['address'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'city' => $data['city'],
                'state' => strtoupper($data['state']),
            ]);

            CompanyUser::query()->create([
                'company_id' => $company->id,
                'user_id' => $user->id,
                'role' => CompanyUserRole::Owner->value,
                'status' => CompanyUserStatus::Active->value,
            ]);

            $user->forceFill([
                'current_company_id' => $company->id,
            ])->save();

            $this->issueVerificationCode($user, $company);

            return $company;
        });
    }

    public function issueVerificationCode(User $user, Company $company): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        CompanyVerificationCode::query()
            ->where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        CompanyVerificationCode::query()->create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'expires_at' => Carbon::now()->addMinutes(15),
            'sent_at' => now(),
        ]);

        return $code;
    }

    private function resolveDocumentType(string $document): ?string
    {
        return match (strlen($document)) {
            11 => 'cpf',
            14 => 'cnpj',
            default => null,
        };
    }
}
