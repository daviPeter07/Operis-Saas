<?php

namespace App\Http\Controllers\Api\Customers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Imports\ImportPreviewResource;
use App\Services\Imports\ImportConfirmService;
use App\Services\Imports\ImportPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerImportController extends Controller
{
    public function __invoke(
        Request $request,
        ImportPreviewService $previewService,
        ImportConfirmService $confirmService
    ): JsonResponse {
        if ($request->hasFile('file')) {
            $validated = $request->validate([
                'file' => ['required', 'file', 'mimes:csv,txt'],
            ]);

            $preview = $previewService->preview('customers', auth()->user()->current_company_id, $validated['file']);

            return response()->json(['data' => ImportPreviewResource::make($preview)]);
        }

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'strategy' => ['required', 'in:ignore,update'],
        ]);

        $result = $confirmService->confirm(
            'customers',
            auth()->user()->current_company_id,
            auth()->id(),
            $validated['strategy'],
            $validated['rows']
        );

        return response()->json(['data' => $result]);
    }
}
