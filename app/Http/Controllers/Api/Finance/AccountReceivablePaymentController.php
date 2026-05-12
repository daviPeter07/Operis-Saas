<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\AccountReceivableSettleRequest;
use App\Http\Requests\Finance\AccountReceivableUnsettleRequest;
use App\Http\Resources\Finance\AccountReceivableResource;
use App\Models\AccountReceivable;
use App\Services\Finance\ReceivableService;
use Illuminate\Http\JsonResponse;

class AccountReceivablePaymentController extends Controller
{
    public function __construct(private readonly ReceivableService $receivableService) {}

    public function __invoke(AccountReceivableSettleRequest $request, AccountReceivable $accountReceivable): JsonResponse
    {
        $this->authorize('update', $accountReceivable);
        $user = $request->user();

        $receivable = $this->receivableService->settle(
            $accountReceivable,
            (int) $user->id,
            $request->validated(),
        );

        return response()->json([
            'data' => AccountReceivableResource::make($receivable),
        ]);
    }

    public function reverse(AccountReceivableUnsettleRequest $request, AccountReceivable $accountReceivable): JsonResponse
    {
        $this->authorize('update', $accountReceivable);
        $user = $request->user();

        $receivable = $this->receivableService->unsettle(
            $accountReceivable,
            (int) $user->id,
        );

        return response()->json([
            'data' => AccountReceivableResource::make($receivable),
        ]);
    }
}
