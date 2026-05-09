<?php

use App\Services\Finance\PayableService;
use App\Services\Finance\ReceivableService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('finance:resync-status {--company_id=}', function (ReceivableService $receivableService, PayableService $payableService) {
    $companyId = $this->option('company_id');
    $resolvedCompanyId = $companyId !== null ? (int) $companyId : null;

    $updatedReceivables = $receivableService->syncStatusesFromSales($resolvedCompanyId);
    $updatedPayables = $payableService->syncStatusesFromPurchases($resolvedCompanyId);

    $scope = $resolvedCompanyId !== null ? "empresa {$resolvedCompanyId}" : 'todas as empresas';

    $this->info("Re-sincronizacao concluida ({$scope}).");
    $this->line("- Contas a receber atualizadas: {$updatedReceivables}");
    $this->line("- Contas a pagar atualizadas: {$updatedPayables}");
})->purpose('Re-sincroniza status financeiro com status de vendas e compras');
