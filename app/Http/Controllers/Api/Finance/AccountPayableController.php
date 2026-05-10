<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreAccountPayableRequest;
use App\Http\Resources\Finance\AccountPayableResource;
use App\Models\AccountPayable;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use App\Services\Finance\PayableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountPayableController extends Controller
{
    public function __construct(
        private readonly AccountPayableRepositoryInterface $payables,
        private readonly PayableService $payableService,
    ) {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountPayableRequest $request): JsonResponse
    {
        $this->payableService->createManual(
            auth()->user()->current_company_id,
            $request->validated()
        );

        return response()->json(['data' => true], 201);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->payableService->syncMissingForCompany(auth()->user()->current_company_id);

        return AccountPayableResource::collection(
            $this->payables->paginateByCompany(auth()->user()->current_company_id)
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(AccountPayable $accountPayable): JsonResponse
    {
        $this->authorize('view', $accountPayable);

        return response()->json(['data' => AccountPayableResource::make($accountPayable)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AccountPayable $accountPayable): JsonResponse
    {
        $this->authorize('delete', $accountPayable);

        $accountPayable->delete();

        return response()->json(['data' => true]);
    }
}
