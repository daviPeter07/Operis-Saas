<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Finance\AccountReceivableResource;
use App\Models\AccountReceivable;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use App\Services\Finance\ReceivableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountReceivableController extends Controller
{
    public function __construct(
        private readonly AccountReceivableRepositoryInterface $receivables,
        private readonly ReceivableService $receivableService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->receivableService->syncMissingForCompany(auth()->user()->current_company_id);

        return AccountReceivableResource::collection(
            $this->receivables->paginateByCompany(auth()->user()->current_company_id)
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(AccountReceivable $accountReceivable): JsonResponse
    {
        $this->authorize('view', $accountReceivable);

        return response()->json(['data' => AccountReceivableResource::make($accountReceivable)]);
    }
}
