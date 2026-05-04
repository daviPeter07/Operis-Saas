<?php

namespace App\Http\Controllers\Api\Onboarding;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class OnboardingStateController extends Controller
{
    /**
     * Return the current onboarding state for the authenticated user.
     *
     * For now we only expose a simple flag indicating whether the
     * company onboarding process is complete. A full implementation
     * would inspect the user's company and verification status.
     */
    public function index(): JsonResponse
    {
        // Placeholder logic – adjust as needed.
        $completed = false; // TODO: replace with real check.
        return response()->json([
            'onboarding_completed' => $completed,
        ]);
    }
}
