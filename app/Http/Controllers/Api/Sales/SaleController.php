<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\StoreSaleRequest;
use App\Http\Requests\Sales\UpdateSaleRequest;
use App\Http\Resources\Sales\SaleResource;
use App\Models\Sale;
use App\Services\Sales\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $saleService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        return SaleResource::collection(
            $this->saleService->list(auth()->user()->current_company_id)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->saleService->create(
            auth()->user()->current_company_id,
            auth()->id(),
            $request->validated()
        );

        return response()->json(['data' => SaleResource::make($sale)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale): JsonResponse
    {
        $this->authorize('view', $sale);

        return response()->json(['data' => SaleResource::make($sale->load('items'))]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleRequest $request, Sale $sale): JsonResponse
    {
        $this->authorize('update', $sale);
        $sale = $this->saleService->update($sale, auth()->id(), $request->validated());

        return response()->json(['data' => SaleResource::make($sale)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale): JsonResponse
    {
        $this->authorize('delete', $sale);
        $this->saleService->cancel($sale, auth()->id());

        return response()->json(status: 204);
    }
}
