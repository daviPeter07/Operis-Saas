<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('account_receivables', function (Blueprint $table) {
            $table->decimal('amount_paid', 14, 2)->default(0)->after('amount');
        });

        Schema::table('account_payables', function (Blueprint $table) {
            $table->decimal('amount_paid', 14, 2)->default(0)->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('account_receivables', function (Blueprint $table) {
            $table->dropColumn('amount_paid');
        });

        Schema::table('account_payables', function (Blueprint $table) {
            $table->dropColumn('amount_paid');
        });
    }
};
