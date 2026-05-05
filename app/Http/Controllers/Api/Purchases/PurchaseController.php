<?php

namespace App\Http\Controllers\Api\Purchases;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Http\Requests\Purchases\UpdatePurchaseRequest;
use App\Http\Resources\Purchases\PurchaseResource;
use App\Models\Purchase;
use App\Services\Purchases\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PurchaseController extends Controller
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        return PurchaseResource::collection(
            $this->purchaseService->list(auth()->user()->current_company_id)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseRequest $request): JsonResponse
    {
        $purchase = $this->purchaseService->create(
            auth()->user()->current_company_id,
            auth()->id(),
            $request->validated()
        );

        return response()->json(['data' => PurchaseResource::make($purchase)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase): JsonResponse
    {
        $this->authorize('view', $purchase);

        return response()->json(['data' => PurchaseResource::make($purchase->load('items'))]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseRequest $request, Purchase $purchase): JsonResponse
    {
        $this->authorize('update', $purchase);
        $purchase = $this->purchaseService->update($purchase, auth()->id(), $request->validated());

        return response()->json(['data' => PurchaseResource::make($purchase)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase): JsonResponse
    {
        $this->authorize('delete', $purchase);
        $this->purchaseService->delete($purchase, auth()->id());

        return response()->json(status: 204);
    }
}
