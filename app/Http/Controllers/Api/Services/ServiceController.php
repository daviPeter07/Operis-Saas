<?php

namespace App\Http\Controllers\Api\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\IndexServiceRequest;
use App\Http\Requests\Services\StoreServiceRequest;
use App\Http\Requests\Services\UpdateServiceRequest;
use App\Http\Resources\Services\ServiceResource;
use App\Models\Service;
use App\Services\Services\ServiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function __construct(private readonly ServiceService $serviceService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(IndexServiceRequest $request): AnonymousResourceCollection
    {
        return ServiceResource::collection(
            $this->serviceService->list(auth()->user()->current_company_id, $request->tableQuery())
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceService->create(auth()->user()->current_company_id, $request->validated());

        return response()->json(['data' => ServiceResource::make($service)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);

        return response()->json(['data' => ServiceResource::make(Service::query()->withPerformedCount()->findOrFail($service->id))]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);
        $service = $this->serviceService->update($service, $request->validated());

        return response()->json(['data' => ServiceResource::make($service)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);
        $this->serviceService->delete($service);

        return response()->json(status: 204);
    }
}
