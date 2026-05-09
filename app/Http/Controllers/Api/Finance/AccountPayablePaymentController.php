<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\AccountPayableSettleRequest;
use App\Http\Resources\Finance\AccountPayableResource;
use App\Models\AccountPayable;
use App\Services\Finance\PayableService;
use Illuminate\Http\JsonResponse;

class AccountPayablePaymentController extends Controller
{
    public function __construct(private readonly PayableService $payableService) {}

    public function __invoke(AccountPayableSettleRequest $request, AccountPayable $accountPayable): JsonResponse
    {
        $this->authorize('update', $accountPayable);
        $payable = $this->payableService->settle(
            $accountPayable,
            (int) auth()->id(),
            $request->validated(),
        );

        return response()->json([
            'data' => AccountPayableResource::make($payable),
        ]);
    }
}
