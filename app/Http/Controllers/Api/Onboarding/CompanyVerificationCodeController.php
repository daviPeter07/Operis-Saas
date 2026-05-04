<?php

namespace App\Http\Controllers\Api\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\CompanyVerificationRequest;
use App\Services\Onboarding\CompanyVerificationService;
use Illuminate\Http\JsonResponse;

class CompanyVerificationCodeController extends Controller
{
    public function __construct(private readonly CompanyVerificationService $companyVerificationService) {}

    public function store(CompanyVerificationRequest $request): JsonResponse
    {
        $this->companyVerificationService->verify($request->user(), $request->validated('code'));

        return response()->json([
            'message' => 'Empresa verificada com sucesso.',
        ]);
    }
}
