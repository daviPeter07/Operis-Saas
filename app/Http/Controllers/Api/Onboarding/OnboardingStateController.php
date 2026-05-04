<?php

namespace App\Http\Controllers\Api\Onboarding;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class OnboardingStateController extends Controller
{
    /**
     * Return the current onboarding state for the authenticated user.
     *
     * Onboarding is considered complete when the user has a current company
     * and that company has been verified (verified_at is not null).
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $company = $user?->currentCompany;

        $completed = $company !== null && $company->verified_at !== null;

        return response()->json([
            'onboarding_completed' => $completed,
        ]);
    }
}
