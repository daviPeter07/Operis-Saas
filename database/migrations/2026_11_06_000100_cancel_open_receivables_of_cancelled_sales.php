<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Cancelling a pending sale used to leave its installments open, so customers kept owing
 * (and using credit limit) for sales that no longer exist. Cancels what is still open on
 * cancelled sales; received money stays received. Running it again changes nothing.
 *
 * Stock is not touched: products moved since then, and the cancel flow now gives it back.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('account_receivables')
            ->whereIn('status', ['pending', 'partial'])
            ->whereIn('sale_id', DB::table('sales')->select('id')->where('status', 'cancelled'))
            ->update(['status' => 'cancelled', 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Which of them were pending or partly paid is still visible from amount_paid; nothing to restore automatically.
    }
};
