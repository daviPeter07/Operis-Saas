<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Finance\AccountPayableResource;
use App\Models\AccountPayable;
use App\Repositories\Contracts\AccountPayableRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountPayableController extends Controller
{
    public function __construct(private readonly AccountPayableRepositoryInterface $payables) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
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
}
