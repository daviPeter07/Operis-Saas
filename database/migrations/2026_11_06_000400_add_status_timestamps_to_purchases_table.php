<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * When the purchase was completed and when it was cancelled (UTC, like the other timestamps).
 * Filled for existing purchases by the purchase history backfill migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('purchases', 'completed_at')) {
            return;
        }

        Schema::table('purchases', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('status');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['completed_at', 'cancelled_at']);
        });
    }
};
