<?php

namespace App\Http\Controllers\Api\Onboarding;

use App\Http\Controllers\Controller;
use App\Services\Onboarding\CompanyVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyVerificationResendController extends Controller
{
    public function __construct(private readonly CompanyVerificationService $companyVerificationService) {}

    public function store(Request $request): JsonResponse
    {
        $this->companyVerificationService->resend($request->user());

        return response()->json([
            'message' => 'Codigo reenviado com sucesso.',
        ]);
    }
}
