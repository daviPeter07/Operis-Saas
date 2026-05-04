<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use Illuminate\Http\JsonResponse;

class AuthenticatedUserController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        $user = auth()->user()?->load('currentCompany');

        return AuthenticatedUserResource::make($user)->response();
    }
}
