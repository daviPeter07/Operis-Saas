<?php

namespace App\Http\Controllers\Api\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\CompanyOnboardingRequest;
use App\Http\Resources\Companies\CompanyOnboardingResource;
use App\Services\Onboarding\CompanyOnboardingService;
use Illuminate\Http\JsonResponse;

class CompanyOnboardingController extends Controller
{
    public function __construct(private readonly CompanyOnboardingService $companyOnboardingService) {}

    public function store(CompanyOnboardingRequest $request): JsonResponse
    {
        $company = $this->companyOnboardingService->createCompany($request->user(), $request->validated());

        return response()->json([
            'message' => 'Empresa criada com sucesso. Codigo de verificacao enviado.',
            'data' => CompanyOnboardingResource::make($company),
        ], 201);
    }
}
