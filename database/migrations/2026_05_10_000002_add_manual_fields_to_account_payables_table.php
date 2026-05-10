<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('account_payables', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('company_id')->constrained()->nullOnDelete();
            $table->date('entry_date')->nullable()->after('installment_number');
            $table->string('item')->nullable()->after('entry_date');
            $table->text('description')->nullable()->after('item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('account_payables', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn(['entry_date', 'item', 'description']);
        });
    }
};
