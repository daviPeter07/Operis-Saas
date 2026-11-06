<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discount applied at checkout: total = subtotal - discount.
 * Existing sales get 0, which matches what was saved for them (the API had no discount field).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'discount')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('discount', 14, 2)->default(0)->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('discount');
        });
    }
};
