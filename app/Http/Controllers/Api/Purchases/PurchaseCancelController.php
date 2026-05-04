<?php

namespace App\Http\Controllers\Api\Purchases;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Services\Purchases\PurchaseService;
use Illuminate\Http\JsonResponse;

class PurchaseCancelController extends Controller
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function __invoke(Purchase $purchase): JsonResponse
    {
        $this->authorize('delete', $purchase);
        $this->purchaseService->cancel($purchase, auth()->id());

        return response()->json(status: 204);
    }
}
