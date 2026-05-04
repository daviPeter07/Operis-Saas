<?php

namespace App\Http\Controllers\Api\Brands;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brands\StoreBrandRequest;
use App\Http\Requests\Brands\UpdateBrandRequest;
use App\Http\Resources\Brands\BrandResource;
use App\Models\Brand;
use App\Services\Brands\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    public function __construct(private readonly BrandService $brandService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        return BrandResource::collection(
            $this->brandService->list(auth()->user()->current_company_id)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->create(auth()->user()->current_company_id, $request->validated());

        return response()->json(['data' => BrandResource::make($brand)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand): JsonResponse
    {
        $this->authorize('view', $brand);

        return response()->json(['data' => BrandResource::make($brand)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $this->authorize('update', $brand);
        $brand = $this->brandService->update($brand, $request->validated());

        return response()->json(['data' => BrandResource::make($brand)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand): JsonResponse
    {
        $this->authorize('delete', $brand);
        $this->brandService->delete($brand);

        return response()->json(status: 204);
    }
}
