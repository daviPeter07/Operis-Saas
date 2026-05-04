<?php

namespace App\Http\Controllers\Api\Suppliers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Imports\ImportPreviewResource;
use App\Services\Imports\ImportConfirmService;
use App\Services\Imports\ImportPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierImportController extends Controller
{
    public function __invoke(
        Request $request,
        ImportPreviewService $previewService,
        ImportConfirmService $confirmService
    ): JsonResponse {
        if ($request->hasFile('file')) {
            $validated = $request->validate(['file' => ['required', 'file', 'mimes:csv,txt']]);
            $preview = $previewService->preview('suppliers', auth()->user()->current_company_id, $validated['file']);

            return response()->json(['data' => ImportPreviewResource::make($preview)]);
        }

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'strategy' => ['required', 'in:ignore,update'],
        ]);
        $result = $confirmService->confirm('suppliers', auth()->user()->current_company_id, auth()->id(), $validated['strategy'], $validated['rows']);

        return response()->json(['data' => $result]);
    }
}
