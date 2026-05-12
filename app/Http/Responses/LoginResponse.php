<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract, Responsable
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->route('dashboard');
    }
}
