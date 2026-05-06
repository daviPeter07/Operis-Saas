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
        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('credit_enabled')->default(false)->after('status');
            $table->decimal('credit_limit', 14, 2)->default(0)->after('credit_enabled');
            $table->unsignedInteger('credit_term_days')->default(30)->after('credit_limit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'credit_enabled',
                'credit_limit',
                'credit_term_days',
            ]);
        });
    }
};
