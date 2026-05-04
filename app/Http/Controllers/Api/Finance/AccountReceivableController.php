<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Finance\AccountReceivableResource;
use App\Models\AccountReceivable;
use App\Repositories\Contracts\AccountReceivableRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountReceivableController extends Controller
{
    public function __construct(private readonly AccountReceivableRepositoryInterface $receivables) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
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
