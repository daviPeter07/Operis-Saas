<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Observações" and "Marcar como entregue" from the sales dialog. Existing sales get no
 * notes and are not marked as delivered.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'notes')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('crediario_entry');
            $table->timestamp('delivered_at')->nullable()->after('cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['notes', 'delivered_at']);
        });
    }
};
