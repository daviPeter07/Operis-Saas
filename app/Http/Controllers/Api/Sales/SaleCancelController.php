<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\Sales\SaleService;
use Illuminate\Http\JsonResponse;

class SaleCancelController extends Controller
{
    public function __construct(private readonly SaleService $saleService) {}

    public function __invoke(Sale $sale): JsonResponse
    {
        $this->authorize('delete', $sale);
        $this->saleService->cancel($sale, auth()->id());

        return response()->json(status: 204);
    }
}
