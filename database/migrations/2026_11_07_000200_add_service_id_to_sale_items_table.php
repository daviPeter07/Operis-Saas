<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A sale item is either a product or a service: product_id becomes nullable and
     * service_id is added. Existing rows (all products) are left as they are.
     */
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->change();
            $table->foreignId('service_id')->nullable()->after('product_id')->constrained()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_id');
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
    }
};
