<?php

namespace App\Services\Onboarding;

use App\Models\Company;
use App\Models\CompanyVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CompanyVerificationService
{
    public function verify(User $user, string $code): void
    {
        $company = $this->resolveCurrentCompany($user);

        $verificationCode = CompanyVerificationCode::query()
            ->where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if (! $verificationCode) {
            throw ValidationException::withMessages([
                'code' => 'Codigo invalido.',
            ]);
        }

        if ($verificationCode->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'code' => 'Codigo expirado.',
            ]);
        }

        if (! Hash::check($code, $verificationCode->code_hash)) {
            throw ValidationException::withMessages([
                'code' => 'Codigo invalido.',
            ]);
        }

        $verificationCode->forceFill([
            'used_at' => now(),
        ])->save();

        $user->forceFill([
            'email_verified_at' => $user->email_verified_at ?? now(),
            'current_company_id' => $company->id,
        ])->save();

        $company->forceFill([
            'verified_at' => now(),
        ])->save();

        session(['current_company_id' => $company->id]);
    }

    public function resend(User $user): void
    {
        $company = $this->resolveCurrentCompany($user);

        $lastCode = CompanyVerificationCode::query()
            ->where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        if ($lastCode?->sent_at && $lastCode->sent_at->gt(now()->subMinute())) {
            throw ValidationException::withMessages([
                'code' => 'Aguarde 1 minuto antes de reenviar o codigo.',
            ]);
        }

        $countLastHour = CompanyVerificationCode::query()
            ->where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->where('sent_at', '>=', now()->subHour())
            ->count();

        if ($countLastHour >= 5) {
            throw ValidationException::withMessages([
                'code' => 'Limite de 5 reenvios por hora atingido.',
            ]);
        }

        app(CompanyOnboardingService::class)->issueVerificationCode($user, $company);
    }

    private function resolveCurrentCompany(User $user): Company
    {
        $company = $user->currentCompany;

        if (! $company) {
            throw ValidationException::withMessages([
                'company' => 'Usuario sem empresa selecionada.',
            ]);
        }

        return $company;
    }
}
