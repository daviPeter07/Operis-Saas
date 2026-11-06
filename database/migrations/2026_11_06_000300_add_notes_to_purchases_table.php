<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Observações" of the purchase dialog. The old dialog showed the field but never saved it,
 * so existing purchases get no notes.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('purchases', 'notes')) {
            return;
        }

        Schema::table('purchases', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('boleto_term_days');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
