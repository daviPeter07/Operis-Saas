<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Manual receivables get the same fields as manual payables: how the customer pays and,
 * when split in boletos, how many there are. Receivables of sales keep both empty (the
 * sale has its own payment method and installments).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('account_receivables', 'payment_method')) {
            return;
        }

        Schema::table('account_receivables', function (Blueprint $table) {
            $table->unsignedSmallInteger('total_installments')->nullable()->after('installment_number');
            $table->string('payment_method', 20)->nullable()->after('received_at');
        });
    }

    public function down(): void
    {
        Schema::table('account_receivables', function (Blueprint $table) {
            $table->dropColumn(['total_installments', 'payment_method']);
        });
    }
};
