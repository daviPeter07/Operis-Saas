<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * amount_paid was added on 2026-05-15 with a default of 0 and the accounts already settled
 * kept that 0. A received receivable or a paid payable was paid in full, so amount_paid is
 * its amount. Runs before the history backfills, which read amount_paid. Idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('account_receivables')
            ->where('status', 'received')
            ->whereColumn('amount_paid', '<', 'amount')
            ->update(['amount_paid' => DB::raw('amount')]);

        DB::table('account_payables')
            ->where('status', 'paid')
            ->whereColumn('amount_paid', '<', 'amount')
            ->update(['amount_paid' => DB::raw('amount')]);
    }

    public function down(): void
    {
        // The old zeros carried no information.
    }
};
