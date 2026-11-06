<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A sale is completed once all its receivables are received or cancelled. Some pending sales
 * had every installment received and were never completed. Runs before the sale history
 * backfill, which then records "Venda concluída" and fills completed_at. Idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('sales')
            ->where('status', 'pending')
            ->whereExists(fn ($query) => $query->selectRaw('1')
                ->from('account_receivables')
                ->whereColumn('account_receivables.sale_id', 'sales.id'))
            ->whereNotExists(fn ($query) => $query->selectRaw('1')
                ->from('account_receivables')
                ->whereColumn('account_receivables.sale_id', 'sales.id')
                ->whereNotIn('account_receivables.status', ['received', 'cancelled']))
            ->update(['status' => 'completed']);
    }

    public function down(): void
    {
        // Pending was wrong for these sales.
    }
};
