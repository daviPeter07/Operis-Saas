<?php

namespace App\Support\Company;

use App\Models\Company;
use App\Models\User;

class CurrentCompanyResolver
{
    public function resolve(User $user): ?Company
    {
        if (! $user->current_company_id) {
            return null;
        }

        return Company::query()->find($user->current_company_id);
    }
}
